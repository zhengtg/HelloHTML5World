/**
 * Created by ztg on 13-10-13.
 */
var ps = ps || {};
ps.columns = 10;
ps.rows = 10;

ps.starType0 = 0;
ps.starType1 = 1;
ps.starType2 = 2;
ps.starType3 = 3;
ps.starType4 = 4;
ps.starTypeNone = 5;

ps.moveTime = 0.3;

//创建一组数据
ps.newPSData = function(){
    var data = [];

    for (var i = 0; i < ps.columns; i++){
        var column = [];
        for (var j = 0; j < ps.rows; j++){
            column.push((Math.floor(Math.random()*10))%ps.starTypeNone);
        }
        data.push(column);
    }
    return data;
};

ps.encodePos = function(c,r){
    return c*100+r;
};

ps.decodePos = function(pos){
    return {
        c:Math.floor(pos/100),
        r:pos%100};
};

ps.getScoreByIndex = function(index){
    return 5*(2*index-1);
}

ps.inArray = function(needle,array,isKey){
	if(typeof(needle)=="string" || typeof(needle)=="number"){
		for(var i in array){    
			if(needle == array[i]){
				if(isKey){
					return i;    
				}    
				return true;    
			}    
		}    
		return false;    
	}  
}


//data: menu item array
ps.findConnectStar = function(data,c,r,array,sType){
    // Check for bounds
    if (c < 0 || c >= data.length) return;
    if (r < 0 || r >= data[c].length) return;

    // Make sure that the star type match
    if (data[c][r].starType != sType) return;

    var tag = ps.encodePos(c,r);
    // Check if idx is already visited
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] == tag) return;
    }

    // Add tag to array
    array.push(tag);

    // Visit neighbours
    ps.findConnectStar(data, c+1, r, array, sType);
    ps.findConnectStar(data, c-1, r, array, sType);
    ps.findConnectStar(data, c, r+1, array, sType);
    ps.findConnectStar(data, c, r-1, array, sType);
};

// remove selected stars, and return updated star info
// return two array
// data: menu item array
// downStars: the down stars of column,such as,{2:[{r=3,down=1},{r=4,down=1},{r=6,down=2}]}
// leftStars: the move left stars of column,such as,[{c=3,left=1},{c=4,left=1},{c=6,left=2}]
ps.updateStars = function(data,selected){
    var markStars = [];
    //mark all remove stars
    for (var i=0;i<selected.length;i++){
        var p = ps.decodePos(selected[i]);
        data[p.c][p.r].starType = ps.starTypeNone;
        if (markStars[p.c] == null ){
            markStars[p.c] = [p.r];
        }else{
            markStars[p.c].push(p.r);
        }
    }

    var downStars = [];
    // get update stars with down info
    //return markStars;
    var startColumn = -1;
    for (var i in markStars){
        //console.log("column",i,markStars[i]);
        if (startColumn == -1){
            startColumn = i;
        }
        var down = 0;
        downStars[i] = [];
        for (var j = markStars[i][0]; j < data[i].length;j++ ){
            if (data[i][j].starType == ps.starTypeNone ){
                down += 1;
            }else{
                downStars[i].push({item:data[i][j],down:down});
            }
        }
    }

    // get update stars with left info
    var leftStars = [];
    var left = 0;
    for (var i = startColumn; i < data.length;i++ ){
        if (markStars[i] != null && markStars[i][0] == 0 && downStars[i].length == 0 ){
            //clear column
            left += 1;
        }else if(left > 0){
            for (var j in data[i]){
                var item = data[i][j];
               if (item.starType != ps.starTypeNone ){
                   leftStars.push({item:item,left:left});
               }
            }
        }
    }

    // remove stars
    var removeStars = [];
    for (var i in markStars){
        for (var j = markStars[i].length-1; j>=0; j--){
            removeStars.push({c:i,r:markStars[i][j]});
        }
    }

    return {removeStars:removeStars,downStars:downStars,leftStars:leftStars};
};

ps.checkStars = function(data){
    for (var i = 0; i < data.length; i++){
        for (var j =0; j < data[i].length; j++){
            var connected = [];
            ps.findConnectStar(data,i,j,connected,data[i][j].starType);
            if (connected.length >=2 ){
                return true;
            }
        }
    }
    return false;
};

