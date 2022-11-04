(async()=>{
    "use strict";

    // Dependencies
    const nimythModule = require("./modules/nimyth")
    const randomString = require("randomstring")
    const randomBytes = require("randombytes")
    const readLine = require("readline-sync")
    const request = require("request-async")
    const clipboardy = require("clipboardy")
    const sovrinDID = require("sovrin-did")
    const { promisify } = require("util")
    var csv = require("csv-stringify")
    const dialogy = require("dialogy")
    const moment = require("moment")
    const chalk = require("chalk")
    const fs = require("fs")

    csv.stringify = promisify(csv.stringify)
    
    // Variables
    var nimyth = {
        serverURL: "https://nimyth.vercel.app/",
        password: null,
        passwords: {
            correctPassword: "ID:19515LZWYZ",
            self: []
        }
    }
    
    const options = require("./options.json")
    
    const sovrin = sovrinDID.gen()
    const nonce = sovrinDID.getNonce()
    const signKey = sovrin.secret.signKey
    const keyPair = sovrinDID.getKeyPairFromSignKey(signKey)
    
    // High Functions
    nimyth.log = function(type, message){
        if(type === "i"){
            console.log(`${chalk.gray(options.log.style.left) + chalk.blueBright(options.log.prefixes.information) + chalk.gray(options.log.style.right)} ${message}`)
        }else if(type === "w"){
            console.log(`${chalk.gray(options.log.style.left) + chalk.yellowBright(options.log.prefixes.warning) + chalk.gray(options.log.style.right)} ${message}`)
        }else if(type === "e"){
            console.log(`${chalk.gray(options.log.style.left) + chalk.red(options.log.prefixes.error) + chalk.gray(options.log.style.right)} ${message}`)
        }else if(type === "c"){
            console.log(`${chalk.gray(options.log.style.left) + chalk.redBright(options.log.prefixes.critical) + chalk.gray(options.log.style.right)} ${message}`)
        }
    }

    // Startup
    nimyth.log("i", "Grabbing server public key, please wait...")
    var serverPK = await request(`${nimyth.serverURL}pk`)
    serverPK = JSON.parse(serverPK.body).pk
    serverPK = Uint8Array.from(serverPK.split(",").map(x=>parseInt(x,10)))

    // Functions
    nimyth.clipboard = function(password){
        return new Promise((resolve)=>{
            if(options.accessibility.autoClipboard){
                clipboardy.writeSync(password)
                nimyth.log("i", "Password has been saved in your clipboard.")
            }else{
                const option = readLine.question(`Do you want to save the bytes in your clipboard? ${options.cli.navigationStyle} `)
    
                if(option === "yes"){
                    clipboardy.writeSync(password)
                    nimyth.log("i", "Password has been saved in your clipboard.")
                }else{
                    nimyth.log("i", "Did not save the password in your clipboard.")
                }
            }
    
            resolve()
        })
    }
    
    nimyth.savePassword = function(password, personal){
        return new Promise(async(resolve)=>{
            if(options.accessibility.passwordHistory || personal){
                nimyth.passwords.self.push({
                    password: password,
                    date: moment().format("MMMM Do YYYY, h:mm:ss a")
                })
            }
    
            resolve()
        })
    }

    nimyth.encrypt = function(string){
        return new Promise(async(resolve)=>{
            var response = await request.post(`${nimyth.serverURL}e`, {
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ pk: keyPair.publicKey.toString(), a: nonce.toString(), s: sovrinDID.encryptMessage(JSON.stringify({ string: string, password: nimyth.password }), nonce, sovrinDID.getSharedSecret(serverPK, keyPair.secretKey)).toString() })
            })

            if(response.body.match("Unknown error. | 91681HZWgZ")){
                nimyth.log("c", "Unknown error.")
                process.exit()
            }

            response = JSON.parse(response.body)
            response.pk = Uint8Array.from(response.pk.split(",").map(x=>parseInt(x,10)))
            response.a = Uint8Array.from(response.a.split(",").map(x=>parseInt(x,10)))
            response.s = Uint8Array.from(response.s.split(",").map(x=>parseInt(x,10)))

            resolve(sovrinDID.decryptMessage(response.s, response.a, sovrinDID.getSharedSecret(response.pk, keyPair.secretKey)).toString())
        })
    }

    nimyth.decrypt = function(encryptedString){
        return new Promise(async(resolve)=>{
            var response = await request.post(`${nimyth.serverURL}d`, {
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ pk: keyPair.publicKey.toString(), a: nonce.toString(), s: sovrinDID.encryptMessage(JSON.stringify({ string: encryptedString, password: nimyth.password }), nonce, sovrinDID.getSharedSecret(serverPK, keyPair.secretKey)).toString() })
            })

            if(response.body.match("Unknown error. | 91681HZWgZ")){
                nimyth.log("c", "Unknown error.")
                process.exit()
            }

            response = JSON.parse(response.body)
            response.pk = Uint8Array.from(response.pk.split(",").map(x=>parseInt(x,10)))
            response.a = Uint8Array.from(response.a.split(",").map(x=>parseInt(x,10)))
            response.s = Uint8Array.from(response.s.split(",").map(x=>parseInt(x,10)))

            resolve(sovrinDID.decryptMessage(response.s, response.a, sovrinDID.getSharedSecret(response.pk, keyPair.secretKey)).toString())
        })
    }
    
    nimyth.writePasswords = function(){
        return new Promise(async(resolve)=>{
            if(nimyth.passwords.self.length){
                const encryptedPasswords = await nimyth.encrypt(JSON.stringify(nimyth.passwords))
    
                fs.writeFileSync("./database/passwords.txt", encryptedPasswords, "utf8")
            }

            resolve()
        })
    }

    nimyth.exit = function(){
        return new Promise(async(resolve)=>{
            await nimyth.writePasswords()
    
            nimyth.log("i", "Safely exiting...")
            setTimeout(()=>{
                process.exit()
            }, 1000)
        })
    }

    nimyth.loadPasswords = function(){
        return new Promise(async(resolve)=>{
            nimyth.log("i", "Loading passwords, please wait...")

            const encryptedPasswords = fs.readFileSync("./database/passwords.txt", "utf8")

            if(options.accessibility.passwordHistory || encryptedPasswords){
                if(encryptedPasswords){
                    const decryptedPasswords = await nimyth.decrypt(encryptedPasswords, nimyth.password)
                    
                    if(!decryptedPasswords.match("ID:19515LZWYZ")){
                        nimyth.log("c", "Invalid password.")

                        return process.exit()
                    }

                    nimyth.passwords = JSON.parse(decryptedPasswords)
                }
            }

            console.clear()
            nimythModule.randomBanner()
            resolve()
        })
    }

    nimyth.askForPassword = function(){
        return new Promise((resolve)=>{
            function ask(){
                console.clear()
                nimythModule.randomBanner()
                const password = readLine.question(`Your password ${options.cli.navigationStyle} `)

                if(!password){
                    nimyth.log("w", "Please type your password.")
                    return setTimeout(ask, 1000 * 3)
                }

                nimyth.password = password
                console.clear()
                resolve()
            }

            ask()
        })
    }
    
    nimyth.start = async function(){
        console.clear()
    
        await nimyth.askForPassword()
        nimythModule.randomBanner()
        await nimyth.loadPasswords()
        nimyth.navigation()
    }
    
    nimyth.navigation = async function(){
        const command = readLine.question(`nim*** ${options.cli.navigationStyle} `)
        const commandArgs = command.split(" ")
    
        if(command === "help"){
            console.log(`
    General Commands
    ================
        Command                     Description
        -------                     -----------
        help                        Show this.
        generate                    Generate a password.
        history                     Show generated passwords.
        add                         Add the password that you want to add in passwords history.
        export                      Export your passwords in plain.
        flush                       Clear all passwords that had been stored.
        exit                        Exit Nimyth.
                        `)
        }else if(commandArgs[0] === "generate"){
            if(!commandArgs[1]){
                console.log(`usage: generate <mode> <length>\nModes: simple, strong, bytes`)
                return nimyth.navigation()
            }
    
            var password;
    
            if(commandArgs[1] === "simple"){
                password = randomString.generate(+commandArgs[2])
    
                nimyth.log("i", `Generated Password: ${password}`)
            }else if(commandArgs[1] === "strong"){
                password = randomString.generate({
                    charset: "!@#$%^&*()+_}{\"?<{P:0987654321ZXCVBNMLPKOJIHUGYFTDRSEAWQlpmnkobjivhucgyxftzdrseawq-+=~`",
                    length: +commandArgs[2]
                })
    
                nimyth.log("i", `Generated Password: ${password}`)
            }else if(commandArgs[1] === "bytes"){
                password = randomBytes(+commandArgs[2]).toString("utf8")
    
                nimyth.log("i", "Bytes password cannot be printed here.")
                await nimyth.clipboard(password)
            }else{
                nimyth.log("e", "Invalid mode.")
            }
    
            await nimyth.savePassword(password)
        }else if(commandArgs[0] === "history"){
            if(!nimyth.passwords.self.length){
                nimyth.log("i", "No passwords found.")
                return nimyth.navigation()
            }

            console.log()
            if(commandArgs[1] === "full"){
                for( const pIndex in nimyth.passwords.self ){
                    const password = nimyth.passwords.self[pIndex]

                    console.log(`[${password.date}] ${+pIndex+1}. ${password.password}`)
                }
            }else{
                for( const pIndex in nimyth.passwords.self ) console.log(`${+pIndex+1}. ${nimyth.passwords.self[pIndex].password}`)
            }
            console.log()
        }else if(commandArgs[0] === "add"){
            if(!commandArgs[1]){
                nimyth.log("i", "usage: add <password>")
                return nimyth.navigation()
            }

            const password = commandArgs.slice(1).join(" ")
            
            await nimyth.savePassword(password, true)
            nimyth.log("i", "Password has been saved.")
        }else if(commandArgs[0] === "export"){
            if(!nimyth.passwords.self.length){
                nimyth.log("i", "No passwords found to export.")
                return nimyth.navigation()
            }

            if(!commandArgs[1]){
                nimyth.log("i", "usage: export <type(json/csv)>")
                return nimyth.navigation()
            }

            if(commandArgs[1] === "json"){
                const outputFilePath = dialogy.saveFile({
                    filter: {
                        patterns: ["*.json"],
                        description: "JSON"
                    }
                })

                fs.writeFileSync(`${outputFilePath}.json`, JSON.stringify(nimyth.passwords.self), "utf8")
                nimyth.log("i", "Passwords has been exported.")
            }else if(commandArgs[1] === "csv"){
                const outputFilePath = dialogy.saveFile({
                    filter: {
                        patterns: ["*.csv"],
                        description: "CSV"
                    }
                })

                var data = [
                    [
                        "Password",
                        "Date"
                    ]
                ]

                for( const password of nimyth.passwords.self ) data.push([password.password, password.date])

                data = await csv.stringify(data)

                fs.writeFileSync(`${outputFilePath}.csv`, data, "utf8")
                nimyth.log("i", "Passwords has been exported.")
            }else{
                nimyth.log("e", "Invalid export type.")
            }
        }else if(command === "flush"){
            return setTimeout(()=>{
                const youSure = readLine.question(`Are you sure you want to flush(y/n)? ${options.cli.navigationStyle} `)
            
                if(youSure === "y"){
                    nimyth.passwords.self = []
                    fs.writeFileSync("./database/passwords.txt", "", "utf8")
                    nimyth.log("w", "All passwords has been flushed.")
                }else{
                    nimyth.log("i", "Aborted flushing.")
                }

                nimyth.navigation()
            }, 2000)
        }else if(command === "exit"){
           await nimyth.exit()
        }else{
            nimyth.log("e", "Unrecognized command.")
        }
    
        nimyth.navigation()
    }
    
    // Main
    nimyth.start()

    setInterval(()=>{
        nimyth.writePasswords()
    }, options.others.passwordsAutoSaveDelay)

    process.on("exit", async()=>{
        await nimyth.exit()
    })
})()