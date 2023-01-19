CREATE TABLE my_employees(
    id SERIAL NOT NULL PRIMARY KEY,
    employee_name VARCHAR(40) NOT NULL
);

CREATE TABLE parking(
    id SERIAL NOT NULL PRIMARY KEY,
    spaces VARCHAR(40) NOT NULL
);

CREATE TABLE waiter_shifts(
    id SERIAL NOT NULL PRIMARY KEY,
    employee_id INT NOT NULL,
    space_id INT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES my_employees(id),
    FOREIGN KEY (space_id) REFERENCES parking(id) 
);

INSERT INTO parking (spaces) VALUES ('Parking 1')
,('Parking 2'),('Parking 3'),('Parking 4'),('Parking 5')
,('Parking 6'),('Parking 7'); 
