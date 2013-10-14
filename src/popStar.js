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
        this.psData = psData;
        this.sMenu = cc.Menu.create();

        var pos = cc.p(0,0);
        for (var i = 0; i < psData.length; i++){
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
            }
            pos.x += sWidth;
            pos.y = 0;
        }
        this.addChild(this.sMenu);
        this.sMenu.setPosition(cc.p(0,0));
    },
    moveDownCount:function(item,count){
        if (item != null ){
            item.runAction(cc.MoveBy.create(count*ps.moveTime,cc.p(0,-count*this.cellSize.height)));
        }
    },
    moveLeftCount:function(item,count){
        if (item != null ){
            item.runAction(cc.MoveBy.create(count*ps.moveTime,cc.p(-count*this.cellSize.width,0)));
        }
    },

    onMenuCallback:function (sender) {
        var pos = sender.getPosition();
        var p = {c:Math.floor(pos.x/this.cellSize.width),r:Math.floor(pos.y/this.cellSize.height)};

        var connected=[];
        ps.findConnectStar(this.psData,p.c,p.r,connected,this.psData[p.c][p.r]);
        console.log("pos",sender.getTag(),p.c,p.r,connected.length);
        connected.sort();
        for (var i=0;i<connected.length;i++){
            var p = ps.decodePos(connected[i]);
            console.log("c,r", p.c, p.r);
            this.sMenu.removeChildByTag(connected[i],true); //add action 1s
        }

        var u = ps.removeStars(this.psData,connected);
        //update
        var updateStars = u.downStars
        var leftStars = u.leftStars;
        console.log("leftStars",leftStars);

        var moveLeft = 0;
        var startC = -1;
        for (var c in updateStars){
            if (startC == -1){
                startC = c;
            }
            console.log("updateStars ",c,updateStars[c]);
            //move down
            for (var r in updateStars[c]){
                var info = updateStars[c][r];
                var item = this.sMenu.getChildByTag(ps.encodePos(parseInt(c),parseInt(info.r)));
                this.moveDownCount(item,info.down);
            }
        }

        for (var c in leftStars){
            for (var r = 0; r < ps.rows; r++ ){
                var item = this.sMenu.getChildByTag(ps.encodePos(parseInt(leftStars[c].c),r));
                this.moveLeftCount(item,leftStars[c].left);
            }
        }

        this.selectedStars = connected;
    }
})