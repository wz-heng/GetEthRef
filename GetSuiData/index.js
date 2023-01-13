const { JsonRpcProvider, Network } = require('@mysten/sui.js');
const AWS = require('aws-sdk');
require('dotenv').config();

const address = process.env.address;

const provider = new JsonRpcProvider(Network.DEVNET);

let awsConfig = {
    "region": "eu-west-1",
    "endpoint": "http://dynamodb.eu-west-1.amazonaws.com",
    "accessKeyId": "AKIATKVC3WRYQ63T2MMR", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();

const main = async () => {
    //console.log(address);
    const objects = await provider.getTransactionsForObject(address);
    console.log(objects)
    for (var i = 0; i < objects.length - 1; i++) {
        let ef = await provider.getTransactionWithEffects(objects[i]);
        console.log(ef);
        // let gas = ef.certificate.data.gasPayment;
        // console.log(gas);
        // let functionName = ef.certificate.data.transactions[0].Call.function.toString();
        // if (functionName.includes("register_suiet", "register_meta", "register_star")){
        //     let arguments = ef.effects.events[6].moveEvent.fields;
        //     domain_name = arguments.name + "." + functionName.split("_")[1]; // 拼接域名
        //     console.log(domain_name);
        //     const params = {
        //         TableName: 'ref_user_register',
        //         Item: {
        //             'domain': domain_name,
        //             'ref_code': arguments.ref_code,
        //             'owner': arguments.creator
        //         }
        //     }
        //     if(arguments.ref_code != '') {
        //         var query_params = {
        //             TableName: "ref_user_create",
        //             IndexName: "ref_code-isValid-index" ,
        //             KeyConditionExpression: 'ref_code = :pkey and isValid = :isValid',
        //             ExpressionAttributeValues: {
        //                ':pkey': arguments.ref_code,
        //                ':isValid': 1
        //             }
        //         };
        //         let res =  await docClient.query(query_params).promise();
        //         console.log(res);
        //         if (res.Count != 0){
        //           params.Item.ref_create_time = res.Items[0].create_time;
        //           params.Item.ref_expire_time = res.Items[0].expire_time;
        //           params.Item.rate = res.Items[0].rate;
        //           params.Item.referee = res.Items[0].user_id;
        //         } 
                
        
        //       } 
              
        //     docClient.put(params).promise();
            
       // }
        
    }
}

main()