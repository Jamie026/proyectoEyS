CREATE TABLE customers (
    RowNumber INT NOT NULL AUTO_INCREMENT,
    Surname TEXT NOT NULL,
    CreditScore INT NOT NULL,
    Geography TEXT NOT NULL,
    Gender TEXT NOT NULL,
    Age INT NOT NULL,
    Tenure INT NOT NULL,
    NumOfProducts INT NOT NULL,
    HasCrCard INT NOT NULL,
    IsActiveMember INT NOT NULL,
    Exited INT NOT NULL,
    Complain INT NOT NULL,
    `Satisfaction Score` INT NOT NULL,
    `Card Type` TEXT NOT NULL,
    `Point Earned` INT NOT NULL,
    Email TEXT NOT NULL,
    CustomerId INT NOT NULL,
    CreditCard INT DEFAULT NULL,
    EstimatedSalary DOUBLE NOT NULL,
    Balance DOUBLE NOT NULL,
    Email_aes VARBINARY(255) DEFAULT NULL,
    CustomerId_aes BINARY(16) DEFAULT NULL,
    CreditCard_aes VARBINARY(255) DEFAULT NULL,
    Balance_aes BINARY(16) DEFAULT NULL,
    Salary_aes BINARY(16) DEFAULT NULL,
    PRIMARY KEY (RowNumber)
);

//Antes de ejecutar el contenido de abajo, hacer los inserts correspondientes para que la encriptación funcione.

UPDATE customers
SET email_aes = AES_ENCRYPT(Email, YOUR_PRIVATE_KEY);

UPDATE customers
SET balance_aes = AES_ENCRYPT(Balance, YOUR_PRIVATE_KEY);

UPDATE customers
SET customerId_aes = AES_ENCRYPT(CustomerId, YOUR_PRIVATE_KEY);

UPDATE customers
SET creditCard_aes = AES_ENCRYPT(CreditCard, YOUR_PRIVATE_KEY);

UPDATE customers
SET salary_aes = AES_ENCRYPT(EstimatedSalary, YOUR_PRIVATE_KEY);

//Eliminamos las tablas que contienen la data cruda, es decir, sin encriptar.

ALTER TABLE customers
DROP COLUMN EstimatedSalary;

ALTER TABLE customers
DROP COLUMN CreditCard;

ALTER TABLE customers
DROP COLUMN CustomerId;

ALTER TABLE customers
DROP COLUMN Balance;

ALTER TABLE customers
DROP COLUMN Email;

SELECT CAST(AES_DECRYPT(salary_aes, YOUR_PRIVATE_KEY) AS CHAR) FROM customers;