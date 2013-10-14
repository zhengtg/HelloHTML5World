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

ps.moveTime = 0.5;

//创建一组数据
ps.newPSData = function(){
    var data = new Array();

    for (var i = 0; i < ps.columns; i++){
        var column = new Array();
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

ps.findConnectStar = function(data,c,r,array,sType){
    // Check for bounds
    if (c < 0 || c >= ps.columns) return;
    if (r < 0 || r >= ps.rows) return;

    var tag = ps.encodePos(c,r);
    // Make sure that the star type match
    if (data[c][r] != sType) return;

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
// downStars: the down stars of column,such as,{2:[{r=3,down=1},{r=4,down=1},{r=6,down=2}]}
// leftStars: the move left stars of column,such as,[{c=3,left=1},{c=4,left=1},{c=6,left=2}]
ps.removeStars = function(data,selected){
    var markStars = [];
    //mark all remove stars
    for (var i=0;i<selected.length;i++){
        var p = ps.decodePos(selected[i]);
      //  data[p.c].splice(p.r,1);
        data[p.c][p.r] = ps.starTypeNone;
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
        console.log("column",i,markStars[i])
        if (startColumn == -1){
            startColumn = i;
        }
        var down = 0;
        downStars[i] = [];
        for (var j = markStars[i][0]; j < ps.rows;j++ ){
            if (data[i][j] == null){
                break;
            }

            if (data[i][j] == ps.starTypeNone ){
                down += 1;
            }else{
                downStars[i].push({r:j,down:down});
            }
        }
    }

    // get update stars with left info
    var leftStars = [];
    var left = 0;
    for (var i = startColumn; i < ps.rows;i++ ){
        if (markStars[i] != null && markStars[i][0] == 0 && downStars[i].length == 0 ){
            //clear column
            left += 1;
        }else if(left > 0){
            leftStars.push({c:i,left:left});
        }
    }

    // remove stars
    for (var i in markStars){
        for (var j in markStars[i]){
            data[i].splice(j,1);
        }
    }

    return {downStars:downStars,leftStars:leftStars};
}

/*
var testData = ps.newPSData();
for (var i in testData)
{
    for (var j in testData[i])
    {
        console.log("testData:",i,j,testData[i][j]);
    }
}
*/