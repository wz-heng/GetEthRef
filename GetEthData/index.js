const Web3 = require('web3');
const fs = require('fs');
const AWS = require('aws-sdk');
const { time } = require('console');
const { start } = require('repl');

let awsConfig = {
  "region": "eu-west-1",
  "endpoint": "http://dynamodb.eu-west-1.amazonaws.com",
  "accessKeyId": "AKIATKVC3WRYQ63T2MMR", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();


// 连接到以太坊网络
const  url = new Web3.providers.HttpProvider(`https://api.avax-test.network/ext/bc/C/rpc`)
const web3 = new Web3(url);

// 要读取交易信息的合约地址
const contractAddress = '0x1dE64b3E8EE06C7fa9ed0D44dF3e902DB3E5a31F';
// const contractAddress = '0xA228f8fD278f8D092fb4ebE4F1cc66eB430c9A20';

const data = fs.readFileSync('./abi.json');
let abi = JSON.parse(data).abi;
  

// 初始化合约对象
const contract = new web3.eth.Contract(abi, contractAddress);


const main = async () => {
    let newBlock = await web3.eth.getBlockNumber();
    let startBlock = JSON.parse(fs.readFileSync('./lastBlock.json')).lastBlockNum;
    console.log(startBlock);
    let data = [];
    await contract.getPastEvents('allEvents', {
        fromBlock: startBlock,
        toBlock: newBlock
      }, function (error, events) {
        data = events;
    });
    for(let index = 0; index < data.length; index++) {
      console.log(data[index]);
      console.log(data[index].returnValues);
      if(data[index].event != "NameRegistered" ) continue;
      let info = data[index].returnValues;
      const params = {
        TableName: 'ref_user_register',
        Item: {
            'domain': info.name + '.' + info.suffix,
            'ref_code': info.refCode,
            'owner': info.owner,
            'fee': info.fee,
            'register_time': new Date().getTime()
        }
    }
      if(info.refCode != '') {
        var query_params = {
            TableName: "ref_user_create",
            IndexName: "ref_code-isValid-index" ,
            KeyConditionExpression: 'ref_code = :pkey and isValid = :isValid',
            ExpressionAttributeValues: {
               ':pkey': info.refCode,
               ':isValid': 1
            }
        };
        let res =  await docClient.query(query_params).promise();
        console.log(res);
        if (res.Count != 0){
          params.Item.ref_create_time = res.Items[0].create_time;
          params.Item.ref_expire_time = res.Items[0].expire_time;
          params.Item.rate = res.Items[0].rate;
          params.Item.referee = res.Items[0].user_id;
        } 
        

     } 
      
      docClient.put(params).promise();
      
    }
    let lastBlockNum = {
      "lastBlockNum": newBlock
    }
    fs.writeFileSync('./lastBlock.json', JSON.stringify(lastBlockNum));
};

setInterval(main, 10000);