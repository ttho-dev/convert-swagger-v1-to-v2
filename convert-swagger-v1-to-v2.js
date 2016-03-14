#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright (C) <2016> <TTHO>
// 
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Name : convert-swagger-v1-to-v2.js
// Version : 1.3.x
// NodeJS
// Author : TTHO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Installation : 
// - NodeJS
// - api-spec-converter (package npm)
// - convert-swagger-v1-to-v2 (package npm)
//	
// Help : 
// - For npm installation, use "npm install -g <package-name>"
//
// Usage :
// - convert-swagger-v1-to-v2 [OPTIONAL:FILE-NAME]
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INITIALISATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("- Process started ...")

var fs = require('fs');
var cp = require('child_process');
var util = require('util');

var fileDirectory = process.cwd();

// Nom du fichier en entrée
var fileNameSwaggerV1 = "swagger.json";
if(process.argv.length > 3){
	console.log("- /!\ To much arguments /!\ ");	
	console.log("- Please, use the following command : convert-swagger-v1-to-v2 [OPTIONAL:FILE-NAME]");
	process.exit();
}else{
	var args = process.argv.slice(2);
	if(typeof args !== 'undefined' && args.length > 0){
		fileNameSwaggerV1 = process.argv[2];
	}else{
		console.log("- Default [FILE-NAME] : swagger.json");
	}
}
 
var fileUrl = fileDirectory + "/" + fileNameSwaggerV1;
if(!fs.existsSync(fileUrl)){
	console.log("- File <"+ fileNameSwaggerV1 +"> not found. You can :");
	console.log(" > Option 1 : Copy/paste a swagger.json in this directory.");
	console.log(" > Option 2 : Use the following command : convert-swagger-v1-to-v2 [FILE-NAME]");
	console.log("- Process aborted");
	process.exit();
}
console.log("- File URL : " + fileUrl);

// Création du dossier tmp, ne fais rien si deja existant
var dir = './tmp';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var fileNameSwaggerV1Cleaned = "swaggerCleanedV1.json";
var fileNameSwaggerV2 = "swaggerV2.json";
var fileNameSwaggerV2Cleaned = "swaggerCleanedV2.json";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN PROCESS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Lecture du fichier swagger.json
fs.readFile(fileUrl, 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
	
	console.log("------------------------------------------------------------------------------------------------------------");
	// Suppression des espaces et saut de ligne à la fin de la data
	data = data.replace(/\s+$/,'');
    // Suppression du premier char si c'est un "["
    var firstString = data.charAt(0);
    if (firstString === "[") {
        data = data.substring(1);
		console.log("-- First character '[' removed");
    }
    // Suppression du dernier char si c'est un "]"
    var lastString = data.slice(-1);
    if (lastString === "]") {
        data = data.slice(0, -1);
		console.log("-- Last character ']' removed");
    }
		
	// Ecriture dans un fichier swaggerCleanedV1.json	
	var fileNameSwaggerV1CleanedPath = fileDirectory + "/tmp/" + fileNameSwaggerV1Cleaned;
	fs.writeFileSync(fileNameSwaggerV1CleanedPath,data,'utf8');
	console.log("-- File <" + fileNameSwaggerV1Cleaned + "> created in folder : <tmp>");
	console.log("------------------------------------------------------------------------------------------------------------");
	
	// Si le fichier swaggerCleanedV1.json créé précédemment existe
	if (fs.existsSync(fileDirectory + "/tmp/" + fileNameSwaggerV1Cleaned)){
		// Conversion du fichier swaggerCleanedV1.json de la version 1.X vers 2.X
		console.log("-- Converting <" + fileNameSwaggerV1Cleaned + "> to <" + fileNameSwaggerV2 + "> with synchronous command <api-spec-converter> ...");
		cp.execSync("api-spec-converter tmp/" + fileNameSwaggerV1Cleaned + " --from=swagger_1 --to=swagger_2 > tmp/" + fileNameSwaggerV2, puts);
		console.log("-- File <" + fileNameSwaggerV2 + "> created in folder : <tmp>");
		console.log("------------------------------------------------------------------------------------------------------------");
		
		console.log("-- Cleaning <" + fileNameSwaggerV2 + "> to <" + fileNameSwaggerV2Cleaned + "> ...");
		// Si le fichier swaggerV2.json créé précédemment existe
		if (fs.existsSync('tmp/'+fileNameSwaggerV2)){
			fs.readFile(fileDirectory + "/tmp/" + fileNameSwaggerV2, 'utf8', function(err, data) {
				// Suppression du/des champ(s) "tags"	
				data = data.replaceAll("tags", "");
				console.log("-- Fields 'tags' removed");
				//	Ecriture dans un fichier swaggerCleanedV2.json	
				var stream2 = fs.createWriteStream(fileDirectory + "/tmp/" + fileNameSwaggerV2Cleaned);
				stream2.once('open', function(fd) {
					stream2.write(data);
					stream2.end();
					console.log("-- File <" + fileNameSwaggerV2Cleaned + "> created in folder : <tmp>");	
					console.log("------------------------------------------------------------------------------------------------------------");
					console.log("- Process finished");
				});
			});
		}else{
			console.log("-- File tmp/" + fileNameSwaggerV2 + " not found" );
			console.log("- Process aborted");
		}	
	}else{
		console.log("-- File tmp/" + fileNameSwaggerV1Cleaned + " not found" );
		console.log("- Process aborted");
	}
});
	



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function puts(error, stdout, stderr) {
    console.log(stdout);
	console.log(stderr);
	if(error !== null){
		console.log("Exec error : " + error);
	}
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};