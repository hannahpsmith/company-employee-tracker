const { getAll, addItem } = require('../queries/queries');

const getAllDepartments = () => {
    return getAll('department');
};

const addDepartment = (name) => {
    return addItem('department', ['name'], [name]);
};

module.exports = {
    getAllDepartments,
    addDepartment
};