var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var path = require('path');

var conf = require('./../properties/conf');
var table_login = conf.MySql.sqlTableUsers;
var table_token = conf.MySql.sqlTableTokens;
var connection;
getMysqlConnection();

setInterval(sql_keep_alive, 1000);

function sql_keep_alive() {
    connection.query('SELECT 1', function (err) {
        if (err) {
            console.error(err);
        }
    });
}

function getMysqlConnection() {
    connection = mysql.createConnection({
        host: conf.MySql.sqlHost,
        user: conf.MySql.sqlUserName,
        password: conf.MySql.sqlPassWord,
        database: conf.MySql.sqlDataBase,
        multipleStatements: true
    });
    connection.connect(function (err, res) {
        if (err) {
            console.log("Error conneting to mysql" + err);
        }
        else {
            console.log("connected to Mysqldb");

        }
    });

}

router.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.post('/RegistrationPage', function (req, response, next) {

    if (validate(req.body.username) && validate(req.body.password)) {


        getNextSequence(function (id) {
            connection.query("insert into " + table_login + " (id,email,password,status,img_id) values(?,?,?,1,0)", [id, req.body.username, req.body.password], function (err, res_login) {
                if (err) {
                    response.send({"status": 0})
                }
                else {
                    if (res_login !== null && res_login !== undefined) {
                        response.send({"status": 1})
                    }
                    else {
                        response.send({"status": 2});
                    }
                }
            })
        })


    }
    else {
        // console.log("---->", req.body, req.body.username);
        response.send({"status": 0})
    }

});

router.post('/LoginPage', function (req, response, next) {
    if (validate(req.body.username) && validate(req.body.password)) {

        var select_query = "select * from " + table_login + " where email='" + req.body.username + "' and " + "password='" + req.body.password + "' and status=1 limit 1;";
        // console.log(select_query)
        connection.query(select_query, function (err, res_login) {
            // console.log(err, res_login)
            if (err) {
                response.send({"status": 0})
            }
            else {
                if (res_login != null && res_login !== undefined && res_login.length > 0) {
                    connection.query("insert into " + table_token + " (email,token) values(?,?)", [req.body.username, req.body.username], function (err, res_access) {
                        // console.log(err, res_access);
                        if (err) {
                            response.send({"status": 0})
                        }
                        else {
                            response.send({"status": 1, "login_key": req.body.username})
                        }
                    })
                }
                else {
                    response.send({"status": 0})
                }
            }
        })
    }
    else {
        // console.log("---->", req.body, req.body.username);
        response.send({"status": 0})
    }
});

router.post('/userData', function (req, response, next) {
    var select_query = "select * from " + table_login + " where email = '" + req.body.token + "';";
    // console.log(select_query);
    connection.query(select_query, function (err, res_data) {
        if (err) {
            response.send({"status": 0})
        }
        else {
            if (res_data !== null && res_data !== undefined && res_data.length > 0) {

                var pure_res = JSON.stringify(res_data);
                var pure_res1 = JSON.parse(pure_res);
                // console.log("okkkksssssssssss", pure_res1[0]["email"]);
                var email = pure_res1[0]["email"];

                response.send({email: email});
            }
            else {
                response.send({"status": 0})
            }
        }
    })
});

router.post('/logout', function (req, response, next) {
    var delete_query = "delete from " + table_token + " where token='" + req.body.token + "'";
    // console.log(delete_query)
    connection.query(delete_query, function (err, res_delete) {
        // console.log(err, res_delete);
        if (err) {
            response.send({"status": 0})
        }
        else {
            response.send({"status": 1})
        }
    })
});


router.post('/showImages', function (req, response, next) {

    // console.log("--------------------------");

    var select_query = "select * from " + table_login + " where email = '" + req.body.token + "';";
    // console.log(select_query);
    connection.query(select_query, function (err, res_data) {
        if (err) {
            response.send({"status": 0})
        }
        else {
            if (res_data !== null && res_data !== undefined && res_data.length > 0) {

                var pure_res = JSON.stringify(res_data);
                var pure_res1 = JSON.parse(pure_res);
                var id = pure_res1[0]["id"];
                var testFolder = path.join(__dirname + '/../public/images/' + id + "/");
                var fs = require('fs');
                fs.readdir(testFolder, function (err, files) {
                    response.send({images: files, "id": id});
                })
            }
            else {
                response.send({"status": 0})
            }
        }
    })


});

router.post('/saveImage', function (req, res) {
    var fs = require('fs');

    var base64Data = req.body.val;
    base64Data = base64Data.replace('data:image/png;base64,', '');
    var binaryData = new Buffer(base64Data, 'base64').toString('binary');


    var query = "select id,img_id from " + table_login + " where email = '" + req.body.user + "';";

    connection.query(query, function (err, res_data) {
        if (err) {
            process.exit(1);
        } else {
            if (res_data) {
                var pure_res = JSON.stringify(res_data);
                var pure_res1 = JSON.parse(pure_res);
                var id = pure_res1[0]["id"];
                var img_id = parseInt(pure_res1[0]["img_id"]);
                var new_img_id = img_id + 1;
                var testFolder = path.join(__dirname + '/../public/images/' + id + "/");
                if (!fs.existsSync(testFolder)) {
                    fs.mkdirSync(testFolder);
                }

                fs.writeFile("" + testFolder + img_id + ".png", binaryData, "binary", function (err) {
                    connection.query("UPDATE " + table_login + " set img_id = " + new_img_id + " where email = '" + req.body.user + "';", function () {
                        if (err) {
                            throw err;
                        } else {
                            console.log("done");
                        }
                    })
                });
            } else {

            }
        }
    })

});

router.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname, '../views/home.html'));
});


function validate(input) {
    var flag_res = null;
    if (input == null || input == undefined || input == '\'\'' || input == '""' || typeof input == 'object' || input.constructor == Array) {
        flag_res = false;
    }
    else {
        flag_res = true;
    }
    return flag_res;
}

function getNextSequence(callback) {
    connection.query("SELECT id from " + table_login + " ORDER BY id DESC LIMIT 1;", function (err, res_id) {
        if (err) {
            process.exit(0);
        }
        else {
            if (res_id !== null && res_id !== undefined && res_id.length > 0) {
                var pure_res = JSON.stringify(res_id);
                var pure_res1 = JSON.parse(pure_res);
                var id = parseInt(pure_res1[0]["id"]);
                callback(id + 1);
            }
            else {
                callback(0);
            }
        }
    })
}


module.exports = router;
