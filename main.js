var express = require('express');
var webdriver = require('selenium-webdriver'), By = webdriver.By, until = webdriver.until,
  chrome = require('selenium-webdriver/chrome'),
  options = new chrome.Options().addArguments([
		  '--disable-gpu',
	     '--disable-impl-side-painting',
		  '--disable-gpu-sandbox',
		'---disable-background-networking',
		'--disable-accelerated-2d-canvas',
		'--disable-accelerated-jpeg-decoding',
		'--no-sandbox',
		'--test-type=ui',
		]);

var Xray = require('x-ray');
var x = new Xray();
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;

var app = new express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

var allData = [];

const driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();

var url = ["https://oss.ticketmaster.com/aps/sackings/EN/buy/details/17KFL"];

function teams (count) {

  count++;

  if(count!=url.length){

var arrSection = [];
var arrRow = [];
var arrSeat = [];
var freeSections = [];
allData = [];

x(url[count], "iframe@src")
	(function(err, item) {
		if (err) console.log(err);
		else {

			driver.get(item);
			driver
				.wait(until.elementLocated(By.id('Complete_Section_110')))
				.findElement(By.xpath("parent::*"))
				.getAttribute("innerHTML")
				.then(function(data) {
					var arr = data.split('\"');
					var sections_arr = [];

					for (var i = 0; i < arr.length; i += 1) {
						if (arr[i].split("")[0] === "C") {

							//if(arr[i].split("")[17]!='0'){
								sections_arr.push({value: arr[i]});
							//}
						}
					}

					//sections_arr.reverse();

					function yankees(i) {

						driver
							.wait(until.elementLocated(By.id(sections_arr[i].value)), 140)
							.then(function() {
								driver
									.executeScript("$('#" + sections_arr[i].value + "').mouseover()")
									.then(function() {
										driver
                      .sleep(70)
                      .then(function() {
                        driver
                          .findElement(By.className('Section_Price_Rollover_Large_Text'))
                          .then(function() {
        										driver
                            .findElement(By.className('Section_Price_Rollover_Large_Text'))
                            .getAttribute('innerHTML')
                            .then(function(result){
                              if(result != '0' && result != 'N/A'){
                                freeSections.push(sections_arr[i-1].value);
                                console.log(sections_arr[i-1].value);
                                console.log(result);
                              }
                            });
                          },
                          function(err){
                            console.log('error');
                          });

                        });

															});

														if (i < sections_arr.length) {
                              i+=2;
                              if(i >= sections_arr.length){
                                //return ;

																function rec(n){
																	driver
																		.wait(until.elementLocated(By.id("Map")),12000)
																		.then(function(){
																			driver
																		.executeScript("$('#" + freeSections[n] + "').click()")
																		.then(function(){
																			driver
																				.wait(until.elementLocated(By.id('seatsBasicMapContainer')))
																				.findElement(By.xpath('div'))
																				.getAttribute('innerHTML')
																				.then(function(data){

																				var arr = data.split('<div class="');
																				arr.shift();
																				arr.unshift('');
																				data = arr.join('!');

																				arr = data.split('" id="');
																				data = arr.join('!');

																				arr = data.split('" style="');
																				data = arr.join('!');
																				arr = data.split('!');

																				var arrId = [];

																				for(var j = 0; j < arr.length; j++){
																					if(j % 3 === 1){
																						if(arr[j] == 'seatUnavailable'){
																							arr[j] = '';
																						}else{
																							arrId.push(arr[j + 1]);

																							driver
																								.executeScript("$('#" + arr[j+1] + "').mouseover()")
																								.then(function(){

																									driver
																										//.sleep(80)
																										.then(function(){

																											driver
																												.findElement(By.className('seat_rollover_holder'))
																												.getAttribute("innerHTML")
																												.then(function(info){

																													var str = info.split("<span>");
																													info = str.join("!");
																													str = info.split("</span>");
																													info = str.join("!");
																													str = info.split("!");
																													var arrData = [];

																													for(var m = 0; m < str.length; m++){

																														if(m == 1 || m == 3 || m == 5 || m == 7){
																															arrData.push(str[m]);
																														}

																													}

																													allData.push(arrData);

																													console.log(arrData);

																												});

																										});

																								});

																									}
																						}
							  													}
																							console.log(arrId);

																							driver
																								.executeScript("$('#Back_Btn').click()")
																								.then(function(){

																															n++;
																															if(n!=freeSections.length){
																																setTimeout(function() {rec(n)}, 4000);
																															}
																															else{

																																//return;
                                                                setTimeout(function() {teams(count)}, 2000);
																															}


																												});
																		});
																		});
																	});
																}
																rec(0);


                              }else{

															setTimeout(function() {yankees(i)}, 180);
                            }

														}
													});

					}

					yankees(0);

				});

	}
});
}
else{
  driver.sleep(10000000);
  driver.quit();
}
}

var job = new CronJob({

  cronTime: "*/5 * * * *",

  onTick: function(){

    teams(-1);

  },

  runOnInit: true,

  start: true

});

job.start();

app.get('/scrap', function(req, res){

res.json({a:allData});

});

app.listen(8000);
