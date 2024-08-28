const db = require('../config/db');

const getAll = async (query) => {
    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error executing getAll query:', error);
        throw error;
    }
};


const addItem = async (table, columns, values) => {
    const columnNames = columns.join(', ');
    const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columnNames}) VALUES (${valuePlaceholders}) RETURNING *`;

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding item:', error);
        throw error; // Re-throw to handle upstream
    }
};

module.exports = {
    getAll,
    addItem
};
