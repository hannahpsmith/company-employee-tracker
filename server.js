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

const displayTrackerSign = () => {
    console.log(" .-------------------------------------------------------------------------------------------------.");
    console.log("|   _________    _______           __           ______     ___  ____     _________     _______      |");
    console.log("|  |  _   _  |  |_   __ \\         /  \\        .' ___  |   |_  ||_  _|   |_   ___  |   |_   __ \\     |");
    console.log("|  |_/ | | \\_|    | |__) |       / /\\ \\      / .'   \\_|     | |_/ /       | |_  \\_|     | |__) |    |");
    console.log("|      | |        |  __ /       / ____ \\     | |            |  __'.       |  _|  _      |  __ /     |");
    console.log("|     _| |_      _| |  \\ \\_   _/ /    \\ \\_   \\ `.___.'\\    _| |  \\ \\_    _| |___/ |    _| |  \\ \\_   |");
    console.log("|    |_____|    |____| |___| |____|  |____|   `._____'    |____||____|  |_________|   |____| |___|  |");
    console.log("|                                                                                                   |");
    console.log(" '-------------------------------------------------------------------------------------------------'");
};


const promptUser = async () => {
    try {

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
                const departmentsList = await getAllDepartments();
                const departmentChoices = departmentsList.map(dept => ({
                    name: dept.name,
                    value: dept.id // Store the ID as the value
                }));

                const { roleTitle, roleSalary, departmentId } = await inquirer.prompt([
                    { type: 'input', name: 'roleTitle', message: 'Enter the role title:' },
                    { type: 'number', name: 'roleSalary', message: 'Enter the salary:' },
                    { type: 'list', name: 'departmentId', message: 'Select the department:', choices: departmentChoices }
                ]);
                await addRole(roleTitle, roleSalary, departmentId);
                console.log('Role added.');
                break;


            case 'Add an employee':
                const rolesList = await getAllRoles();
                const roleChoices = rolesList.map(role => ({
                    name: role.title,
                    value: role.id // Store the ID as the value
                }));

                // Fetch existing managers
                const employeesList = await getAllEmployees();
                const managerChoices = employeesList.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id // Store the ID as the value
                }));
                managerChoices.push({ name: 'None', value: null }); // Option for no manager

                const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
                    { type: 'input', name: 'firstName', message: 'Enter the employee’s first name:' },
                    { type: 'input', name: 'lastName', message: 'Enter the employee’s last name:' },
                    { type: 'list', name: 'roleId', message: 'Select the role:', choices: roleChoices },
                    { type: 'list', name: 'managerId', message: 'Select the manager (if any):', choices: managerChoices }
                ]);
                await addEmployee(firstName, lastName, roleId, managerId);
                console.log('Employee added.');
                break;


            case 'Update an employee role':
                const employeesForUpdate = await getAllEmployees();
                const employeeChoices = employeesForUpdate.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id // Store the ID as the value
                }));

                const rolesForUpdate = await getAllRoles();
                const roleChoicesForUpdate = rolesForUpdate.map(role => ({
                    name: role.title,
                    value: role.id // Store the ID as the value
                }));

                const { employeeId, newRoleId } = await inquirer.prompt([
                    { type: 'list', name: 'employeeId', message: 'Select the employee to update:', choices: employeeChoices },
                    { type: 'list', name: 'newRoleId', message: 'Select the new role:', choices: roleChoicesForUpdate }
                ]);
                await updateEmployeeRole(employeeId, newRoleId);
                console.log('Employee role updated.');
                break;
        }

        // Restart application for more actions
        await promptUser();

        } catch (error) {
            console.error('Error:', error);
        }
    };

    initializeDatabase().then(() => {
        displayTrackerSign();
        promptUser();
    }).catch(error => {
        console.error('Error initializing database:', error);
    });