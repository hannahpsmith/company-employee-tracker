require('dotenv').config();
const { Pool } = require('pg');
const inquirer = require('inquirer');
const db = require('./config/db');
const { getAllDepartments, addDepartment } = require('./models/department');
const { getAllEmployees, addEmployee, updateEmployeeRole } = require('./models/employee');
const { getAllRoles, addRole } = require('./models/role');

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        // Create database if it doesn't exist
        await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
        console.log('Database created.');
    } catch (error) {
        if (error.code === '42P04') { // Database already exists
            console.log('Database already exists.');
        } else {
            console.error('Error creating database:', error);
            throw error;
        }
    } finally {
        client.release();
    }

    // Connect to the newly created database
    const dbPool = new Pool({
        user: process.env.DB_USER,
        host: 'localhost',
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    const dbClient = await dbPool.connect();
    try {
        // Create tables
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS department (
                id SERIAL PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL
            );
            CREATE TABLE IF NOT EXISTS role (
                id SERIAL PRIMARY KEY,
                title VARCHAR(30) UNIQUE NOT NULL,
                salary DECIMAL NOT NULL,
                department_id INTEGER NOT NULL,
                FOREIGN KEY (department_id) REFERENCES department(id)
            );
            CREATE TABLE IF NOT EXISTS employee (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(30) NOT NULL,
                last_name VARCHAR(30) NOT NULL,
                role_id INTEGER NOT NULL,
                manager_id INTEGER,
                FOREIGN KEY (role_id) REFERENCES role(id),
                FOREIGN KEY (manager_id) REFERENCES employee(id)
            );
        `);
        console.log('Tables created.');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        dbClient.release();
    }
};

initializeDatabase().then(() => {
const startApp = async () => {
    try {
        console.log(" .-------------------------------------------------------------------------------------------------.");
        console.log("|   _________    _______           __           ______     ___  ____     _________     _______      |");
        console.log("|  |  _   _  |  |_   __ \\         /  \\        .' ___  |   |_  ||_  _|   |_   ___  |   |_   __ \\     |");
        console.log("|  |_/ | | \\_|    | |__) |       / /\\ \\      / .'   \\_|     | |_/ /       | |_  \\_|     | |__) |    |");
        console.log("|      | |        |  __ /       / ____ \\     | |            |  __'.       |  _|  _      |  __ /     |");
        console.log("|     _| |_      _| |  \\ \\_   _/ /    \\ \\_   \\ `.___.'\\    _| |  \\ \\_    _| |___/ |    _| |  \\ \\_   |");
        console.log("|    |_____|    |____| |___| |____|  |____|   `._____'    |____||____|  |_________|   |____| |___|  |");
        console.log("|                                                                                                   |");
        console.log(" '-------------------------------------------------------------------------------------------------'");
        
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role'
                ]
            }
        ]);

        switch (answers.action) {
            case 'View all departments':
                const departments = await getAllDepartments();
                console.table(departments);
                break;

            case 'View all roles':
                const roles = await getAllRoles();
                console.table(roles);
                break;

            case 'View all employees':
                const employees = await getAllEmployees();
                console.table(employees);
                break;

            case 'Add a department':
                const { departmentName } = await inquirer.prompt([
                    { type: 'input', name: 'departmentName', message: 'Enter the name of the department:' }
                ]);
                await addDepartment(departmentName);
                console.log('Department added.');
                break;

            case 'Add a role':
                const { roleTitle, roleSalary, roleDepartmentId } = await inquirer.prompt([
                    { type: 'input', name: 'roleTitle', message: 'Enter the role title:' },
                    { type: 'number', name: 'roleSalary', message: 'Enter the salary:' },
                    { type: 'number', name: 'roleDepartmentId', message: 'Enter the department ID:' }
                ]);
                await addRole(roleTitle, roleSalary, roleDepartmentId);
                console.log('Role added.');
                break;

            case 'Add an employee':
                const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
                    { type: 'input', name: 'firstName', message: 'Enter the employee’s first name:' },
                    { type: 'input', name: 'lastName', message: 'Enter the employee’s last name:' },
                    { type: 'number', name: 'roleId', message: 'Enter the role ID:' },
                    { type: 'number', name: 'managerId', message: 'Enter the manager’s ID (if any):', default: null }
                ]);
                await addEmployee(firstName, lastName, roleId, managerId);
                console.log('Employee added.');
                break;

            case 'Update an employee role':
                const { employeeId, newRoleId } = await inquirer.prompt([
                    { type: 'number', name: 'employeeId', message: 'Enter the ID of the employee to update:' },
                    { type: 'number', name: 'newRoleId', message: 'Enter the new role ID:' }
                ]);
                await updateEmployeeRole(employeeId, newRoleId);
                console.log('Employee role updated.');
                break;
        }

        // Restart application for more actions
        startApp();
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    startApp();
}).catch(error => {
    console.error('Error initializing database:', error);
});
