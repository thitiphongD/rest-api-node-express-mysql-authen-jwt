const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'your_host',
    user: 'your_user',
    password: 'your_password',
    database: 'your_database'
})

connection.connect(function(err) {
    if (err) throw err;
    console.log('Database connected')
})

module.exports = connection;