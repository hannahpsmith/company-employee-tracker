const { getAll, addItem } = require('../queries/queries');

const getAllRoles = () => {
    return getAll(`
        SELECT r.id, r.title, r.salary, d.name AS department
        FROM role r
        JOIN department d ON r.department_id = d.id
    `);
};

const addRole = (title, salary, departmentId) => {
    return addItem('role', ['title', 'salary', 'department_id'], [title, salary, departmentId]);
};

module.exports = {
    getAllRoles,
    addRole
};
