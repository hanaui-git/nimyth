"use strict";

// Dependencies
const chalk = require("chalk")

// Variables
var nimyth = {}

// Functions
function mainBanner(){
    console.log(chalk.magentaBright(`
    __      _    _____     __    __    __      __  ________   __    __  
    /  \\    / )  (_   _)    \\ \\  / /    ) \\    / ( (___  ___) (  \\  /  ) 
   / /\\ \\  / /     | |      () \\/ ()     \\ \\  / /      ) )     \\ (__) /  
   ) ) ) ) ) )     | |      / _  _ \\      \\ \\/ /      ( (       ) __ (   
  ( ( ( ( ( (      | |     / / \\/ \\ \\      \\  /        ) )     ( (  ) )  
  / /  \\ \\/ /     _| |__  /_/      \\_\\      )(        ( (       ) )( (   
 (_/    \\__/     /_____( (/          \\)    /__\\       /__\\     /_/  \\_\\  
                                                                         
    `))
}

function russianKindaBanner(){
    console.log(chalk.magentaBright(`     
                _   _ ___  __   ____   _____   _____ 
                | \\ | |_  | \\ \\ / |. | /_  \\ \\ / |_  |
                |  \\| | | |  \\ V / | |   | |  V /  |_|
                | |\\  | | |___\\  \\ | |___| | |\\ \\     
                |_| \\_| | |______| |_______|_| \\_\\    
                        |_|                                                                                   
    `))
}


// Main
nimyth.randomBanner = function(){
    const banners = [mainBanner, russianKindaBanner]

    banners[Math.floor(Math.random() * banners.length)]()

    console.log(chalk.magenta(`     ~~> Your wonderful & powerful passwords generator framework <~~`))
    console.log()
}

module.exports = nimyth