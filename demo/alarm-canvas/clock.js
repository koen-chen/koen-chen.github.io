function Clock() {
	this.panelCanvas = document.getElementById('panelCanvas');
	this.panelCtx = this.panelCanvas.getContext('2d');

	this.clockCanvas = document.getElementById('clockCanvas');
	this.clockCtx = this.clockCanvas.getContext('2d');
	this.clockCtx.fillStyle = 'rgba(39, 46, 56, 0.8)';

	this.alarmCanvas = document.getElementById('alarmCanvas');
	this.alarmCtx = this.alarmCanvas.getContext('2d');
	
	this.tickCanvas = document.getElementById('tickCanvas');
	this.tickCtx = this.tickCanvas.getContext('2d');

	this.rectLength = 20;
	this.rectWidth = 6; 
	this.capWidth = 6;
	this.linePadding = 2;
	this.lineLength = this.rectLength + this.capWidth * 2 + this.linePadding * 2;

	this.digitMargin = 4;
	this.digitWidth = this.lineLength + this.digitMargin * 2;
	this.dotsWidth = this.rectWidth + this.digitMargin * 2;

	//数字每条线的显示规则
	this.lineRules = {
		'top' : [1, 4],
		'leftTop': [1,2,3,7],
		'leftBottom': [1,3,4,5,7,9],
		'bottom': [1,4,7],
		'rightTop': [5,6],
		'rightBottom': [2],
		'middle': [0, 1, 7]
	};

	//星期文字规则
	this.weekRules = {
		0: 'Sunday',
		1: 'Monday',
		2: 'Tuesday',
		3: 'Wednesday',
		4: 'Thursday',
		5: 'Friday',
		6: 'Saturday'
	};

	//每个时间设置点的值，放置位置，文本显示位置
	this.digitRules = {
		'hour1' : {
			value: 0, //value
			x: 70, //x coordinate
			tx: 78 //text coordinate
		},
		'hour2' : { value: 0, x: 105, tx: 113 },
		'minute1': { value: 0, x: 170, tx: 178 },
		'minute2': { value: 0, x: 205, tx: 213 },
		'second1': { value: 0, x: 270, tx: 278 },
		'second2': { value: 0, x: 305, tx: 313 }
	};

	//增减操作规则
	this.operateRules = {
		plus: function(type){
			var temp = this.digitRules[type].value + 1;
			this.digitRules[type].value = temp > 9 ? 9 : temp;
			return this.digitRules[type].value;
		}.bind(this),
		minus: function(type){
			var temp = this.digitRules[type].value - 1;
			this.digitRules[type].value = temp < 0 ? 0 : temp;
			return this.digitRules[type].value;
		}.bind(this)
	};

	//闹钟每个时间设置点放置规则
	this.regionXRules = [
		[ 73, 92, 'hour1' ],
		[ 108, 127, 'hour2' ],
		[ 173, 192, 'minute1' ],
		[ 208, 227, 'minute2' ],
		[ 273, 292, 'second1' ],
		[ 308, 327, 'second2' ]
	];

	//闹钟按钮放置规则
	this.regionYRules = [
		[ 135, 155, 'plus' ],
		[ 195, 215, 'minus' ]
	];

	//闹钟面板上所有可点击按钮放置区域
	this.buttonRules = [
		[ 360, 380, 10, 30, 'closeAlarm'],
		[ 130, 196, 260, 304, 'updateAlarm'],
		[ 210, 276, 260, 304, 'clearAlarm']
	];

	this.weekCache = '';
	this.dateCache = '';
	this.alarmCache = ''; //闹钟时间缓存

	this.imgList = ['panel', 'minus', 'plus', 'close', 'arrow', 'tick', 'turnOn', 'turnOff'];
	this.imgLoaded = 0;

	//闹铃滴答声
	this.audio = new Audio('resources/tick.mp3');
	this.audio.loop = true;

	this.loadImg();
}

Clock.prototype = {
	//预先加载完所有图片
	loadImg: function(){
		var _this = this;
		this.imgList.forEach(function(item){
			var name = item + 'Img'; 
			_this[name] = new Image();
			_this[name].src = 'resources/' + item + '.png';
			_this[name].onload = function(){
				_this.imgLoaded += 1;
				if (_this.imgLoaded == _this.imgList.length) {
					_this.init();
				}
			}
		})
	},

	//开始绘制
	init: function(){
		this.drawPanel();
		this.drawButton(this.turnOffImg);
		this.drawClock();
		this.update();
		this.bindEvent();
	},

	//绘制外围面板
	drawPanel: function(){
		this.panelCtx.save();
		this.panelCtx.shadowOffsetX = 6;
		this.panelCtx.shadowOffsetY = 6;
		this.panelCtx.shadowBlur = 8;
		this.panelCtx.shadowColor = 'rgba(100,100,100,0.4)';
		this.panelCtx.drawImage(this.panelImg, 20, 100, 340, 251);

		this.panelCtx.fillStyle = '#f48c12';
		this.panelCtx.font = '16px Microsoft YaHei';
		this.panelCtx.fillText('点击时钟图标设置闹铃', 110, 60);

		this.panelCtx.shadowOffsetX = 0;
		this.panelCtx.shadowOffsetY = 0;
		this.panelCtx.shadowBlur = 0;
		this.panelCtx.drawImage(this.arrowImg, 170, 70);
		this.panelCtx.restore();
	},

	//绘制设置闹铃按钮
	drawButton: function(btn){
		this.panelCtx.save();
		this.panelCtx.rect(168, 122, 48, 48);
		this.panelCtx.clip();
		this.panelCtx.clearRect(0, 0, this.panelCtx.canvas.width, this.panelCtx.canvas.height);
		this.panelCtx.fillStyle = '#f2f2f2';
		this.panelCtx.fillRect(168, 122, 48, 48);
		this.panelCtx.drawImage(btn, 168, 122, 48, 48);
		this.panelCtx.restore();
	},

	//绘制数字时钟
	drawClock: function(){
		var date = new Date();
		
		this.updateWeek(date);
		this.updateDate(date);

		this.clockCtx.save();
		this.clockCtx.translate(44, 224);
		var hourInfo = this.parseTime(date.getHours());
		this.makeHour(hourInfo.a, hourInfo.b);
		
		this.drawDots(this.digitWidth * 2 + this.digitMargin, 25);
		
		var minuteInfo = this.parseTime(date.getMinutes());
		this.makeMinute(minuteInfo.a, minuteInfo.b);
		
		this.drawDots(this.digitWidth * 4 + this.digitMargin + this.dotsWidth, 25);
		
		var secondInfo = this.parseTime(date.getSeconds());
		this.makeSecond(secondInfo.a, secondInfo.b);

		var nowTemp = hourInfo.a + '' + hourInfo.b + '' + minuteInfo.a + '' + minuteInfo.b + '' + secondInfo.a + '' + secondInfo.b;
		this.checkAlarm(nowTemp);
		
		this.clockCtx.restore();
	},

	//绘制闹钟制定面板
	drawAlarm: function(){
		this.alarmCanvas.style.display = 'block';
		this.alarmCtx.save();

		this.alarmCtx.beginPath();
		this.alarmCtx.shadowOffsetX = 0;
		this.alarmCtx.shadowOffsetY = 0;
		this.alarmCtx.shadowBlur = 16;
		this.alarmCtx.shadowColor = 'rgba(100,100,100,0.8)';
		this.alarmCtx.fillStyle = 'rgba(255,255,255,1)';
		this.alarmCtx.fillRect(10, 10, 380, 340);

		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#ddd';
		this.alarmCtx.shadowBlur = 0;
		this.alarmCtx.fillRect(60, 100, 80, 125);
		this.alarmCtx.fillRect(160, 100, 80, 125);
		this.alarmCtx.fillRect(260, 100, 80, 125);

		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#fff';
		this.alarmCtx.fillRect(70, 160, 26, 30);
		this.alarmCtx.fillRect(105, 160, 26, 30);
		this.alarmCtx.fillRect(170, 160, 26, 30);
		this.alarmCtx.fillRect(205, 160, 26, 30);
		this.alarmCtx.fillRect(270, 160, 26, 30);
		this.alarmCtx.fillRect(305, 160, 26, 30);
		
		this.alarmCtx.drawImage(this.minusImg, 73, 195);
		this.alarmCtx.drawImage(this.minusImg, 108, 195);
		this.alarmCtx.drawImage(this.minusImg, 173, 195);
		this.alarmCtx.drawImage(this.minusImg, 208, 195);
		this.alarmCtx.drawImage(this.minusImg, 273, 195);
		this.alarmCtx.drawImage(this.minusImg, 308, 195);
		this.alarmCtx.drawImage(this.plusImg, 73, 135);
		this.alarmCtx.drawImage(this.plusImg, 108, 135);
		this.alarmCtx.drawImage(this.plusImg, 173, 135);
		this.alarmCtx.drawImage(this.plusImg, 208, 135);
		this.alarmCtx.drawImage(this.plusImg, 273, 135);
		this.alarmCtx.drawImage(this.plusImg, 308, 135);
		this.alarmCtx.drawImage(this.closeImg, 360, 10);

		this.alarmCtx.beginPath();
		this.alarmCtx.font = '12px Verdana';
		this.alarmCtx.fillStyle = '#555';
		this.alarmCtx.fillText('HOURS', 77, 120);
		this.alarmCtx.fillText('MINUTES', 173, 120);
		this.alarmCtx.fillText('SECONDS', 270, 120);

		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#82cddd';
		this.alarmCtx.strokeStyle = '#72c1d2';
		this.alarmCtx.rect(130, 260, 66, 44);
		this.alarmCtx.fill();
		this.alarmCtx.stroke();

		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#f6a7b3';
		this.alarmCtx.strokeStyle = '#eb9ba7';
		this.alarmCtx.rect(210, 260, 66, 44);
		this.alarmCtx.fill();
		this.alarmCtx.stroke();

		this.alarmCtx.fillStyle = '#fff';
		this.alarmCtx.font = 'bold 16px Microsoft YaHei';
		this.alarmCtx.fillText('设置', 146, 290);
		this.alarmCtx.fillText('清除', 228, 290);

		this.alarmCtx.fillStyle = '#555';
		this.alarmCtx.font = '16px Verdana';
		this.alarmCtx.fillText(this.digitRules['hour1'].value, 78, 180);
		this.alarmCtx.fillText(this.digitRules['hour2'].value, 113, 180);
		this.alarmCtx.fillText(this.digitRules['minute1'].value, 178, 180);
		this.alarmCtx.fillText(this.digitRules['minute2'].value, 213, 180);
		this.alarmCtx.fillText(this.digitRules['second1'].value, 278, 180);
		this.alarmCtx.fillText(this.digitRules['second2'].value, 313, 180);
		
		this.alarmCtx.fillStyle = '#555';
		this.alarmCtx.font = '20px Microsoft YaHei';
		this.alarmCtx.fillText('设 置 闹 铃 时 间', 120, 60);
		this.alarmCtx.restore();
	},

	//绘制闹铃触发面板
	drawTick: function(){
		this.tickCanvas.style.display = 'block';

		this.tickCtx.save();
		this.tickCtx.beginPath();
		this.tickCtx.shadowOffsetX = 0;
		this.tickCtx.shadowOffsetY = 0;
		this.tickCtx.shadowBlur = 16;
		this.tickCtx.shadowColor = 'rgba(100,100,100,0.8)';
		this.tickCtx.fillStyle = 'rgba(255,255,255,1)';
		this.tickCtx.fillRect(10, 10, 380, 380);

		this.tickCtx.shadowOffsetX = 0;
		this.tickCtx.shadowOffsetY = 0;
		this.tickCtx.shadowBlur = 0;
		this.tickCtx.fillStyle = '#dd6f46';
		this.tickCtx.font = 'bold 46px Microsoft YaHei';
		this.tickCtx.fillText('亲，到点了！', 90, 100);

		this.tickCtx.beginPath();
		this.tickCtx.fillStyle = '#dd6f46';
		this.tickCtx.strokeStyle = '#eb9ba7';
		this.tickCtx.rect(140, 270, 120, 50);
		this.tickCtx.fill();
		this.tickCtx.stroke();

		this.tickCtx.drawImage(this.tickImg, 145, 130);

		this.tickCtx.fillStyle = '#fff';
		this.tickCtx.font = 'bold 16px Microsoft YaHei';
		this.tickCtx.fillText('OK', 185, 300);
		this.tickCtx.restore();

		this.audio.play();
	},

	//绑定事件
	bindEvent: function(){
		var _this = this;

		this.clockCanvas.addEventListener('click', function(event){
			var x = event.offsetX == undefined? event.layerX : event.offsetX;
			var y = event.offsetY == undefined? event.layerY : event.offsetY;
			if (x > 175 && x < 210 && y > 130 && y < 164) {
				_this.drawAlarm();
			}
		}, false);

		this.alarmCanvas.addEventListener('click', function(event){
			var x = event.offsetX == undefined? event.layerX : event.offsetX;
			var y = event.offsetY == undefined? event.layerY : event.offsetY;

			var returnPointer = false;
			_this.buttonRules.forEach(function(item){
				if (x > item[0] && x < item[1] && y > item[2] && y < item[3]) {
					returnPointer = true;
					_this[item[4]].call(_this);
				}
			});

			if (returnPointer) {
				return;
			}

			var xt = x;
			var yt = y;
			var type = null;
			var opera = null;
			_this.regionXRules.forEach(function(item){
				if (xt > item[0] && xt < item[1]) {
					type = item[2];
				}
			});	
			_this.regionYRules.forEach(function(item){
				if (yt > item[0] && yt < item[1]) {
					opera = item[2];
				}
			});
			type && opera && _this.setDigit(type, opera);
		}, false);

		this.tickCanvas.addEventListener('click', function(event){
			var x = event.offsetX == undefined? event.layerX : event.offsetX;
			var y = event.offsetY == undefined? event.layerY : event.offsetY;

			if (x > 140 && x < 260 && y > 270 && y < 320) {
				_this.closeTick();
			}
		}, false);
	},

	//设置时钟单个数字
	setDigit: function(type, opera){
		var x = this.digitRules[type].x;
		var tx = this.digitRules[type].tx;
		var value = this.operateRules[opera](type);

		this.alarmCtx.save();
		this.alarmCtx.beginPath();
		this.alarmCtx.rect(x, 160, 25, 30);
		this.alarmCtx.clip();
		this.alarmCtx.clearRect(0, 0, this.alarmCtx.canvas.width, this.alarmCtx.canvas.height);
		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#fff';
		this.alarmCtx.fillRect(x, 160, 25, 30);
		this.alarmCtx.beginPath();
		this.alarmCtx.fillStyle = '#555';
		this.alarmCtx.font = '16px Verdana';
		this.alarmCtx.fillText(value, tx, 180);
		this.alarmCtx.restore();
	},

	//更新闹铃
	updateAlarm: function(){
		var h = this.digitRules['hour1'].value + '' + this.digitRules['hour2'].value;
		var m = this.digitRules['minute1'].value + '' + this.digitRules['minute2'].value;
		var s = this.digitRules['second1'].value + '' + this.digitRules['second2'].value;

		if (parseInt(h) > 24 || parseInt(m) > 59 || parseInt(s) > 59) {
			alert('时间设置有误，请修正');
			return;
		}
		if (parseInt(h) == 24) {
			if (parseInt(m) != 0 || parseInt(s) != 0) {
				alert('时间设置有误，请修正');
				return;
			}
		}

		this.alarmCache = h + '' + m + '' + s;
		this.drawButton(this.turnOnImg);  
		this.closeAlarm();
	},

	//清除闹铃
	clearAlarm: function(){
		this.alarmCache = '';
		this.digitRules['hour1'].value = 0;
		this.digitRules['hour2'].value = 0;
	  	this.digitRules['minute1'].value = 0;
	 	this.digitRules['minute2'].value = 0;
	  	this.digitRules['second1'].value = 0;
	  	this.digitRules['second2'].value = 0; 
	  	this.drawButton(this.turnOffImg);  
		this.closeAlarm();
	},

	//关闭闹钟面板
	closeAlarm: function(){
		this.alarmCtx.clearRect(0, 0, this.alarmCtx.canvas.width, this.alarmCtx.canvas.height);
		this.alarmCanvas.style.display = 'none';
	},

	//判断闹铃时间是否到点
	checkAlarm: function(now){
		if (now == this.alarmCache) {
			this.drawTick();
		}
	},

	//关闭闹铃滴答声
	closeTick: function() {
		this.tickCtx.clearRect(0, 0, this.tickCanvas.width, this.tickCanvas.height);
		this.tickCanvas.style.display = 'none';
		this.clearAlarm();
		this.audio.pause();
		this.audio.currentTime = 0;
	},

	//绘制水平线
	drawHorizonLine: function(x, y, type){
		var v = y + this.rectWidth;
	
		this.clockCtx.save();
		this.clockCtx.beginPath();
		this.clockCtx.moveTo(x, y);
		switch (type) {
			case 'bottom':
				v = y - this.rectWidth;
			case 'top':
				this.clockCtx.lineTo(x + this.rectLength + this.capWidth * 2, y);
				this.clockCtx.lineTo(x + this.rectLength + this.capWidth, v);
				this.clockCtx.lineTo(x + this.capWidth, v);
				break;
			case 'middle':
				this.clockCtx.lineTo(x + this.capWidth, y - this.rectWidth/2);
				this.clockCtx.lineTo(x + this.capWidth + this.rectLength, y - this.rectWidth/2);
				this.clockCtx.lineTo(x + this.capWidth * 2 + this.rectLength, y);
				this.clockCtx.lineTo(x + this.capWidth + this.rectLength, y + this.rectWidth/2);
				this.clockCtx.lineTo(x + this.capWidth, y + this.rectWidth/2);
				this.clockCtx.lineTo(x, y);
				break;
		}
		this.clockCtx.fill();
		this.clockCtx.restore();
	},

	//绘制垂直线
	drawVerticalLine: function(x, y, type){
		var v = type == 'left' ? x + this.rectWidth : x - this.rectWidth;

		this.clockCtx.save();
		this.clockCtx.beginPath();
		this.clockCtx.moveTo(x, y);
		this.clockCtx.lineTo(x, y + this.capWidth * 2 + this.rectLength);
		this.clockCtx.lineTo(v, y + this.capWidth + this.rectLength);
		this.clockCtx.lineTo(v, y + this.capWidth);
		this.clockCtx.fill();
		this.clockCtx.restore();
	},

	//绘制点号
	drawDots: function(x, y){
		this.clockCtx.save();
		this.clockCtx.beginPath();
		this.clockCtx.rect(x, y, this.rectWidth, this.rectWidth);
		this.clockCtx.fill();

		this.clockCtx.beginPath();
		this.clockCtx.rect(x, y + 25, this.rectWidth, this.rectWidth);
		this.clockCtx.fill();
		this.clockCtx.restore();
	},

	//绘制数字
	drawDigit: function(x, y, number){
		var x = x + this.digitMargin;
		var y = y + this.digitMargin;

		//top
		if (this.lineRules.top.indexOf(number) == -1) {
			this.drawHorizonLine(x + this.linePadding, y, 'top');
		}

		//middle
		if (this.lineRules.middle.indexOf(number) == -1) {
			this.drawHorizonLine(x + this.linePadding, y + this.lineLength - this.linePadding/2, 'middle');
		}

		//bottom
		if (this.lineRules.bottom.indexOf(number) == -1) {
			this.drawHorizonLine(x + this.linePadding, y + this.lineLength * 2 , 'bottom');
		}

		//left top
		if (this.lineRules.leftTop.indexOf(number) == -1) {
			this.drawVerticalLine(x, y + this.linePadding, 'left');
		}
		
		//left bottom
		if (this.lineRules.leftBottom.indexOf(number) == -1) {
			this.drawVerticalLine(x, y + this.lineLength , 'left');
		}

		//right top
		if (this.lineRules.rightTop.indexOf(number) == -1) {
			this.drawVerticalLine(x + this.lineLength, y + this.linePadding, 'right');
		}

		//right bottom
		if (this.lineRules.rightBottom.indexOf(number) == -1) {
			this.drawVerticalLine(x + this.lineLength, y + this.lineLength, 'right');
		}
	},

	//时间设置工具
	makeTimeDigit: function(type, number, first) {
		var location;
		switch (type) {
			case 'hour':
				location = first? 0 : this.digitWidth;
				break;
			case 'minute':
				location = first? this.digitWidth * 2 + this.dotsWidth : this.digitWidth * 3 + this.dotsWidth;
				break;
			case 'second':
				location = first? this.digitWidth * 4 + this.dotsWidth * 2 : this.digitWidth * 5 + this.dotsWidth * 2;
				break;
		}

		this.clockCtx.save();
		this.clockCtx.clearRect(location, 0, this.clockCtx.canvas.width, this.clockCtx.canvas.height);
		this.drawDigit(location, 0, number);
		this.clockCtx.restore();
	},

	//时
	makeHour: function(a, b) {
		this.makeTimeDigit('hour', a, true);
		this.makeTimeDigit('hour', b, false);
	},

	//分
	makeMinute: function(a, b) {
		this.makeTimeDigit('minute', a, true);
		this.makeTimeDigit('minute', b, false);
	},
	
	//秒
	makeSecond: function(a, b) {
		this.makeTimeDigit('second', a, true);
		this.makeTimeDigit('second', b, false);
	},

	//处理当前时间
	parseTime: function(time) {
		var arr = time.toString().split('');	
		var a = arr.length == 1 ? 0 : arr[0];
		var b = arr.length == 1 ? arr[0] : arr[1];
		
		return {
			a: parseInt(a),
			b: parseInt(b)
		};
	},

	//更新星期
	updateWeek: function(date) {
		var weekInfo = date.getDay();
		if (weekInfo == this.weekCache) {
			return;
		}
		var text = this.weekRules[weekInfo];

		this.clockCtx.save();
		this.clockCtx.clearRect(0, 0, this.clockCtx.canvas.width, 200);
		this.clockCtx.translate(30, 155);
		this.clockCtx.fillStyle="rgba(100, 100, 100, 0.8)";
		this.clockCtx.font = '16px Verdana';
		this.clockCtx.fillText(text, 0, 0);
		this.clockCtx.restore();
	},

	//更新年月日
	updateDate: function(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var dateInfo = year + '-' + month + '-' + day;
		
		if (dateInfo == this.dateCache) {
			return;
		}

		this.clockCtx.save();
		this.clockCtx.translate(260, 155);
		this.clockCtx.clearRect(0, 0, this.clockCtx.canvas.width, 200);
		this.clockCtx.fillStyle="rgba(100, 100, 100, 0.8)";
		this.clockCtx.font = '16px Verdana';
		this.clockCtx.fillText(dateInfo, 0, 0);
		this.clockCtx.restore();
	},

	//更新时钟
	update: function(){
		setInterval(function(){
			this.drawClock();
		}.bind(this), 1000);
	}
};

new Clock();