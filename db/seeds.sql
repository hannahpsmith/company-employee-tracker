INSERT INTO department (name) VALUES 
('Marketing'),
('Finance'),
('Information Technology');

INSERT INTO role (title, salary, department_id) VALUES 
('Manager', 70000, 1),
('Accountant', 60000, 1),
('IT Support Technician', 70000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('Jill', 'Johnson', 7, 2); 