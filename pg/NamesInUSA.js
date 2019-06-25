
const Sequelize = require('sequelize')
const {Model} = Sequelize;
const sequelize = new Sequelize({
    database : 'postgres',
    username : 'cache',
    password : '12345678',
    host: 'localhost',
    dialect : 'postgres'
});

class NamesInUSA extends Model{}
NamesInUSA.init({
    id :{
        type : Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    name :{
        type : Sequelize.STRING
    },
    state :{
        type : Sequelize.STRING
    },
    year: {
        type: Sequelize.INTEGER
    },
    gender :{
        type : Sequelize.STRING,
    },
    total:{
        type: Sequelize.INTEGER
    }
}, {
    timestamps : false,
    modelName : 'namesinusa',
    tableName : 'namesinusa',
    schema: 'public',
    sequelize
});

module.exports = NamesInUSA;