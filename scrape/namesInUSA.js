
const request = require('request');
const NamesInUSAPG = require('../pg/NamesInUSA');
let skip = 0;

async function scrapeData(skip, size){
    return await new Promise((res, rej) => {
        request.post({
            url: 'https://www.kaggleusercontent.com/services/datasets/kaggle.dataview.v1.DataViewer/GetDataView',
            body: JSON.stringify({
                jwe: {
                    encryptedToken: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..X5SbBnoEyir7T4UMSobqTA.5mUXzRV8LFb-22BnZpWUEdf6igKFgZGy-8AghIPUH563v0ScqhyQzGxCbCRLcIkjIWBR7jL3-mOlxTsKLNTs8gdsCwE4yMQK11ZbMaTCtvgZactecafYW-ok9ni_kwBwQmoBXbhPP4XDaLEvABqr0uyg2TEZqF2iHNNzUlctbOVbVgE3E0Bsb4Z3VYPIcGgqlIMCKjUB5cR1v-2Ur0XfT6KNkxxXs5JYBFQy_NaEpjwatAOWw20PEoPHXQ_GQFPRS5gRz41FAGtNla_sYh0_JGakkN5KjZV-bNqhHz6fgmpysQrHUK6Rbjxeeo3TYg42KK61VjslEAFa4kYPV-NPekd5Xp_GppBQyJFw1blSbMHQw6ic5on9Fzm6_AHAZ3PXqDTKDGVZFeRSh4tcO7BbQfJyoySLPEpyq5UISXsJZiPhz0LPjUl5Ha2TCWoU0o4jj6HMR2Ke5Au0PIAO7EjDF1WYi2pALcFqkJ2C3BXFuoaYzKJZP0PIgX4SJ9hFlVwaWDRK4wALd7i_LCx6PohKMG1Hrl7RgaflDZkIQyVw6WUGyI8lTsIqAamOO0uGW47hIg4NYnNeEKq8edUZZDa0yHNGptModWyUeRD3Zq8Us-sJtycKtIMBo6K7MbcWUJh0.E-bPHDltyl5s-MvDZoF1LA"
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
    let skip = 652000, size = 1000, done = 0, total = 0;
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



