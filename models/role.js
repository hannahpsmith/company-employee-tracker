const { getAll, addItem } = require('../queries/queries');

// Fetch all roles with their department details
const getAllRoles = () => {
    const query = `
        SELECT r.id, r.title, r.salary, d.name AS department
        FROM role r
        JOIN department d ON r.department_id = d.id
    `;
    return getAll(query); // Execute the SQL query using the getAll function
};

// Add a new role to the database
const addRole = (title, salary, departmentId) => {
    return addItem('role', ['title', 'salary', 'department_id'], [title, salary, departmentId]);
};

module.exports = {
    getAllRoles,
    addRole
};
