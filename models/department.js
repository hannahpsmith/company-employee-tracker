const { getAll, addItem } = require('../queries/queries');

// Fetch all departments
const getAllDepartments = () => {
    const query = `
        SELECT id, name
        FROM department
    `;
    return getAll(query); // Use the getAll function to execute the SQL query
};

// Add a new department
const addDepartment = (name) => {
    return addItem('department', ['name'], [name]);
};

module.exports = {
    getAllDepartments,
    addDepartment
};
