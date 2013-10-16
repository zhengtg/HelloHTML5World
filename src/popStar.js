/**
 * Created by ztg on 13-10-13.
 */


var PopStartLayer = cc.LayerGradient.extend({
    psData:null,
    selectedStars:null,
    sMenu:null,
    cellSize:cc.size(0,0),
    ctor:function () {
        this._super();
        this.init( cc.c4b(0,0,0,255), cc.c4b(0x46,0x82,0xB4,255));
        var viewSize = cc.Director.getInstance().getVisibleSize();
        this.setContentSize(viewSize);
        var sWidth = viewSize.width/ps.columns;
        var sHeight = sWidth;
        this.cellSize = cc.size(sWidth,sHeight);
        console.log("cell info sWidth:",viewSize.width,viewSize.height,sWidth,sHeight);
        var psData = ps.newPSData();
        this.psData = [];
        this.sMenu = cc.Menu.create();
        this.selectedStars = [];

        var pos = cc.p(0,0);
        for (var i = 0; i < psData.length; i++){
            this.psData.push([]);
            for (var j = 0; j < psData[i].length; j++){
                var label = cc.LabelTTF.create(psData[i][j]+"",'Times New Roman',32, cc.size(sWidth,sHeight),
                    cc.TEXT_ALIGNMENT_CENTER,cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
                    //cc.LabelBMFont.create(psData[i][j]+"", s_font_futura);
                var item = cc.MenuItemLabel.create(label,this.onMenuCallback,this);
                item.setTag(ps.encodePos(i,j));

                //test
                var label = cc.LabelTTF.create(item.getTag()+"",'Times New Roman',18, cc.size(sWidth,sHeight),
                    cc.TEXT_ALIGNMENT_CENTER,cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM);
                item.addChild(label);
                label.setPosition(cc.p(sWidth/2,sHeight/2));
                label.setColor(cc.c3(255,0,0));

                this.sMenu.addChild(item);
                item.setAnchorPoint(cc.p(0,0));
                item.setPosition(pos);
                pos.y += sHeight;

                item.starType = psData[i][j];
                this.psData[i].push(item);
            }
            pos.x += sWidth;
            pos.y = 0;
        }
        this.addChild(this.sMenu);
        this.sMenu.setPosition(cc.p(0,0));
    },
    moveDownCount:function(item,count){
        if (item != null ){
            item.runAction(cc.MoveBy.create(ps.moveTime,cc.p(0,-count*this.cellSize.height)));
        }
    },
    moveLeftCount:function(item,count){
        if (item != null ){
            item.runAction(cc.MoveBy.create(ps.moveTime,cc.p(-count*this.cellSize.width,0)));
        }
    },

    onMenuCallback:function (sender) {
        var pos = sender.getPosition();
        var p = {c:Math.floor(pos.x/this.cellSize.width+0.5),r:Math.floor(pos.y/this.cellSize.height+0.5)};
        console.log("onMenuCallback c,r,tag,type",p.c,p.r,ps.encodePos(p.c, p.r),sender.starType);

        if (this.selectedStars.length >=2){
            if (ps.inArray(ps.encodePos(p.c, p.r),this.selectedStars,false)){
                //already selected, clear it
                console.log("already selected, clear it");
            }else{
                //select a new one
                this.selectedStars = [];
                ps.findConnectStar(this.psData,p.c,p.r,this.selectedStars,this.psData[p.c][p.r].starType);
                console.log("select another new one");
                return;
            }
        }else{
            //select a new one
            this.selectedStars = [];
            ps.findConnectStar(this.psData,p.c,p.r,this.selectedStars,this.psData[p.c][p.r].starType);
            console.log("select a new one");
            if (this.selectedStars.length == 1){
                //play select one music
                console.log("play select one music");
            }
            return;
        }

        this.sMenu.stopAllActions();

        var connected=[];
        ps.findConnectStar(this.psData,p.c,p.r,connected,this.psData[p.c][p.r].starType);
        console.log("connected count",connected.length);
        if (connected.length <= 1){
            console.log("select only one star!");
            return;
        }

        connected.sort();
        var u = ps.updateStars(this.psData,connected);

        //update
        var updateStars = u.downStars
        var leftStars = u.leftStars;
        var removeStars = u.removeStars;

        console.log("removeStars",removeStars);
        console.log("leftStars",leftStars);
        console.log("updateStars ",updateStars);

        //move stars
        for (var i=0;i<removeStars.length;i++){
            var p = removeStars[i];
            //console.log("remove c,r", p.c, p.r);
            var item = this.psData[p.c][p.r];
            this.sMenu.removeChild(item,true); //add action 1s
            this.psData[p.c].splice(p.r,1);
        }

        //update top stars
        var startC = -1;
        for (var c in updateStars){
            if (startC == -1){
                startC = c;
            }
            //move down
            for (var r in updateStars[c]){
                var info = updateStars[c][r];
                this.moveDownCount(info.item,info.down);
            }
        }

        //update right stars
        for (var i in leftStars){
            this.moveLeftCount(leftStars[i].item,leftStars[i].left);
        }

        //remove empty columns
        if (leftStars.length > 0){
            for (var i = this.psData.length-1;i>=0;i--){
                if (this.psData[i].length ==0 ){
                    this.psData.splice(i,1);
                }
            }
        }

        //check is game over?
        this.sMenu.runAction(cc.Sequence.create(cc.DelayTime.create(1.5),
                                cc.CallFunc.create(function(){
                                    if (!ps.checkStars(this.psData)){
                                        this.gameOverCallBack();
                                    }else{
                                        console.log("checkStars ok");
                                    }
                                },this)));
        this.selectedStars = [];
    },
    gameOverCallBack:function(){
        console.log("checkStars game over",this.psData);
    }
});