//对象收编变量   单一职责原则
var bird = {
    skyPosition: 0,
    skyStep: 2,
    birdTop: 220,
    birdStepY: 0,
    startColor: 'white',
    startFlag: false,
    minTop: 0,
    maxTop: 570,
    pipeLength: 4,
    pipeArr: [],
    pipeLastIndex: 3,
    score: 0,
    rankListNum: 8,

    /************************************************************************/
    //初始化
    init: function () {  
        this.initData();
        this.animate();
        this.handle();
        if (sessionStorage.getItem('play'))
        {
            this.start();
        }
    },
    initData: function () {  
        this.el = document.getElementById("game");
        this.oBird = this.el.getElementsByClassName('bird')[0];
        this.oStart = this.el.getElementsByClassName('start')[0];
        this.oScore = this.el.getElementsByClassName('score')[0];
        this.oMask = this.el.getElementsByClassName('mask')[0];
        this.oEnd = this.el.getElementsByClassName('end')[0];
        this.oFinalScore = this.oEnd.getElementsByClassName('final_score')[0];
        this.oRankList = this.oEnd.getElementsByClassName('rank_list')[0];
        this.oRestart = this.oEnd.getElementsByClassName('restart')[0];
        this.scoreArr = this.getScore();
    },
    getScore: function () {
        var scoreArr = getLocal('score');
        return scoreArr ? scoreArr : [];
    },

    /************************************************************************/
    //动作
    animate: function () { 
        var count = 0;

        var self  = this; 
        this.timer = setInterval(function(){
            self.skyMove();
            if (self.startFlag) {
                self.birdDrop();
                self.pipeMove();
            }
            if (++ count % 10 === 0 && !self.startFlag) {
                self.birdJump();
                self.startBounce();
            }
            self.birdFly(count);
        }, 30);
    },
    skyMove: function () {  
        this.skyPosition -= this.skyStep;
        this.el.style.backgroundPositionX = this.skyPosition + 'px'; 
    }, 
    birdJump: function () {
        this.birdTop = this.birdTop === 220 ? 260 : 220;
        this.oBird.style.top = this.birdTop + 'px';
    },
    birdFly: function (count) {
        this.oBird.style.backgroundPositionX = count%3 * -30 + 'px';
    },
    birdDrop: function () {
        this.birdTop += ++ this.birdStepY;
        this.oBird.style.top = this.birdTop + 'px';
        this.judgeKnock();
        this.addScore();
    },
    pipeMove: function () {
        for (var i = 0; i < this.pipeLength; i++) {
            var oUpPipe = this.pipeArr[i].up;
            var oDownPipe = this.pipeArr[i].down;
            var x = oUpPipe.offsetLeft - this.skyStep;

            if (x < -52) {
                var lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPipe.style.left = lastPipeLeft + 300 + 'px';
                oDownPipe.style.left = lastPipeLeft + 300 + 'px';
                this.pipeLastIndex = ++ this.pipeLastIndex % this.pipeLength;

                var pipeHeight = this.getPipeHeight();
                oUpPipe.style.height = pipeHeight.up;
                oDownPipe.style.height = pipeHeight.down;
                continue;
            }

            oUpPipe.style.left = x + 'px';
            oDownPipe.style.left = x + 'px';
        }
    },
    startBounce: function () { 
        var preColor = this.startColor;
        this.startColor = preColor === 'blue' ? 'white' : 'blue';
        this.oStart.classList.remove('start-' + preColor);
        this.oStart.classList.add('start-' + this.startColor);
    },
    /************************************************************************/
    //碰撞检测
    judgeKnock: function () {
        this.judgeBoundary();
        this.judgePipe();
    },
    judgeBoundary: function () {
        if (this.birdTop < this.minTop || this.birdTop > this.maxTop) {
            this.gameFailed();
        }
    },
    judgePipe: function () {
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        var pipeY = this.pipeArr[index].y;
        var birdY = this.birdTop;
        if ((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])) {
            this.gameFailed();
        }
    },
    addScore: function () {
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        if (pipeX < 13) {
            this.score ++;
            this.oScore.innerText = this.score;
        }
    },

    /************************************************************************/
    //点击事件触发
    handle: function () {
        this.handleStart();
        this.handleClick();
        this.handleRestart();
    },
    handleStart: function () {
        this.oStart.onclick = this.start.bind(this);
    },
    start: function () {
        var self = this;
        self.startFlag = true;
        self.oBird.style.left = '80px';
        self.oBird.style.transition = 'none';
        self.oStart.style.display = 'none';
        self.oScore.style.display = 'block';
        self.skyStep = 5;

        for (var i = 0; i < self.pipeLength; i++) {
            self.createPipe(300 * (i + 1));
        }
    },
    //玩游戏
    handleClick: function (x) {
        var self = this;
        this.el.onclick = function (e) {
            var isContain = e.target.classList.contains('start');
            if (!isContain) {
                self.birdStepY = -10;
            }
        };
    },
    handleRestart: function () {
        this.oRestart.onclick = function () {
            sessionStorage.setItem('play', true);
            window.location.reload();
        };
    },
    
    //创建障碍管道
    createPipe: function (x) {
        var pipeHeight = this.getPipeHeight();
        var oUpPipe = createEle('div', ['pipe', 'pipe-up'], {
            height: pipeHeight.up + 'px',
            left: x + 'px'
        });
        var oDownPipe = createEle('div', ['pipe', 'pipe-down'], {
            height: pipeHeight.down + 'px',
            left: x + 'px'
        });

        this.el.appendChild(oUpPipe);
        this.el.appendChild(oDownPipe);
        this.pipeArr.push({
            up: oUpPipe,
            down: oDownPipe,
            y: [pipeHeight.up, pipeHeight.up + 150]
        });
    },
    getPipeHeight: function() {
        var upHeight = 50 + Math.floor(Math.random() * 175);
        var downHeight = 600 - 150 - upHeight;

        return {
            up: upHeight,
            down: downHeight
        };
    },
    
    /************************************************************************/
    //失败后操作
    gameFailed: function() {
        clearInterval(this.timer);
        this.oBird.style.display = 'none';
        this.oScore.style.display = 'none';
        this.oMask.style.display = 'block';
        this.oEnd.style.display = 'block';

        this.oFinalScore.innerText = this.score;
        this.setScore();
        this.renderRankList();
    },
    
    setScore: function() {
        this.scoreArr.push({
           score: this.score,
           time: this.getDate()
        });
        //排序
        this.scoreArr.sort(function(a, b){
           return b.score - a.score;
        });
        this.scoreArr.splice(this.rankListNum);//只显示前八位         
        setLocal('score', this.scoreArr);
   },

   getDate: function () {
       var d = new Date();
       var year = d.getFullYear();
       var month = formatNum(d.getMonth() + 1);
       var day = formatNum(d.getDate());
       var hour = formatNum(d.getHours());
       var minute = formatNum(d.getMinutes());
       var second = formatNum(d.getSeconds());

       return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
   },

    renderRankList: function () {
        var template = '';        
        for (var i = 0; i < this.scoreArr.length; i++)
        {
            var rankNum = '';
            switch (i) {
                case 0:
                    rankNum = 'first';
                    break;
                case 1:
                    rankNum = 'second';
                    break;
                case 2:
                    rankNum = 'third';
                    break;
                default:
                    break;
            }

            template += `
            <li>
                <span class="rank_degree ${rankNum}">${i+1}</span>
                <span class="rank_score ${rankNum}">${this.scoreArr[i].score}</span>
                <span class="rank_time ${rankNum}">${this.scoreArr[i].time}</span>
            </li>
            `;
        }

        this.oRankList.innerHTML = template;
    }
};
