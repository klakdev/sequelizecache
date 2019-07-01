
const request = require('request');
const NamesInUSAPG = require('../pg/NamesInUSA');
let skip = 0;

async function scrapeData(skip, size){
    return await new Promise((res, rej) => {
        request.post({
            url: 'https://www.kaggleusercontent.com/services/datasets/kaggle.dataview.v1.DataViewer/GetDataView',
            body: JSON.stringify({
                jwe: {
                    encryptedToken: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..t723WNxIBhhv6CqacVbF8A.KRSZ45JrV5Qj_YmjCo55D1kGF6RwcOJQxZY93h_fNf8Cmm2lKJ9DXMaqp-sgBBhGM-3SPnEEl3o8tl9Pq1pvSgOAuVM0TQt_GvuZgoadWmBTPd5NI_Do02MZvrBdR15025qnTOauAqL-5_Sh0Ee-OKAItNCjoHVfjZBA-bUEAU-bhq46QElA_Ty02UJgeziqazEtL_MGac0Y1siMzA3UZZHoUOAgR2Sfme5UurUYsb7XTjZ74cAdD-H4tNt8qGvWGONTKlqwFX4d6_yhjvhoKgHUyytYKrtfnAtQbF6HB1hYLqY9FyDo3mC5jlNRHoBtTZxNBDgkxLOmbx7AC6bmbtiIbeLC7m1P74i-t-XnNMBSGdX8vxg4DiVVLufPHcC1t-EOpWA6g92mZHjuEqb2WYxSiQEdjAaMGjGHdwyq8RHr9HKsWq0wWCGJD5XZkja-luQboMLdDdJfe5DC8xcRFuOwkf6MZ61DQZYyskUbrdy4esAkQ4gNE0z5AY0gfktuFVkd1SKA6pZPI73UdYJ0qk2vhpOEcPd14QPA6eO12C1SqRRWoRppcvs7Rnj-7baPzi3CadHDwX7CLQ7rxRUgo9gKTnImEn230LutF8CPy4nQ2xjkd4ajTzxjb3dNs1Ed.UTCz1Qvc39dZizbwg3_drA"
                },
                source: {
                    type: 3,
                    dataset: {
                        url: "datagov/usa-names",
                        tableType: 2,
                        bigquery: {
                            tableName: "usa_1910_2013"
                        }
                    }
                },
                operations: null,
                select: ["state", "gender", "year", "name", "number"],
                skip: skip,
                take: size
            })
        }, (err, data) =>{
            if(err) return rej(err);
            res(parse(data));
        })
    });
}

function parse(data){
    let {body} = data.toJSON();
    let {dataView : {totalRows, rowsReturned, rows}} = JSON.parse(body);
    return {
        totalRows : parseInt(totalRows), rows: rows.map(row => {
            let [state, gender, year, name, total] = row.text;
            return {state, gender, year: parseInt(year), name, total : parseInt(total)};
        })
    };
}

async function insertToDB(rows){
    await NamesInUSAPG.bulkCreate(rows, {
        fields : ["state","name","year","gender","total"]
    }).catch(err =>{
        console.error(err);
    });
}
async function nextPortion(skip, size){
    let {totalRows, rows} = await scrapeData(skip, size);
    await insertToDB(rows);
    return [totalRows, rows.length]
}

async function main(){
    let skip = 2508000 , size = 1000, done = 0, total = 0;
    do{
        let [totalRows, inserted] = await nextPortion(skip, size);
        done += inserted;
        skip += inserted;
        size = Math.min(size, inserted);
        total = totalRows;
    }
    while (done < total)
}

main().then(()=>{
    console.log('done');
})



