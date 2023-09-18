//-------------------------
// 初期値
//-------------------------
const CELL = 20; 				//テトリミノ(正方形)の一辺の長さ


//テトリスの色指定
const tetColor =
[
//フィールド,NEXT 領域,フィールド壁面,背景
"white", "#DDD", "#999", "#FFC","yellow","aqua","lime","deeppink","royalblue","orange","mediumorchid",
];
//キャンバスの２次元配列（28 行×14 列）※各セルの色番号をセット
const fieldLine=[3,2,0,0,0,0,0,0,0,0,0,0,2,3]; //フィールド行初期値
let canvas = []; 		//変数 canvas を配列にする
				
//テトリミノ表示セル位置（7種類×4セル×[行,列]）
const tetModel = [
  
  [[1,1,1100],[1,2,110],[2,1,1001],[2,2,11]],// O 型 
 
  [[1,0,1101],[1,1,101],[1,2,101],[1,3,111]],// I 型 
  
  [[1,2,1100],[1,3,111],[2,1,1101],[2,2,11]],// S 型
  
  [[1,0,1101],[1,1,110],[2,1,1001],[2,2,111]],// Z 型
  
  [[1,0,1110],[2,0,1001],[2,1,101],[2,2,111]],// J 型
 
  [[1,3,1110],[2,1,1101],[2,2,101],[2,3,11]],// L 型
  
  [[1,1,1110],[2,0,1101],[2,1,1],[2,2,111]]// T 型
];



let gameID; 		//ゲーム開始制御 ID（setInterval 起動 ID）
let mNum, next; 	//テトリミノ番号, NEXT テトリミノ番号
const startY=2, startX=5; 	//テトリミノ落下開始位置（2 行 5 列）
let cY, cX; 				//テトリミノ表示行,列
let delY; 				//削除行（テトリミノ着地時の cY）
let delTotal; //レベル UP 判定用の削除行数合計
let total; //得点合計
const delPoint = [0,50,100,300,1000]; //削除行数に応じた加算点
let level; //ゲームレベル
const levelMax = 7; //最高レベル
//const levelUpLine = 5; //レベル UP 条件（削除行数）
const levelUpLine = 2;//★デバッグ用
let speed; //setInterval の関数 play 呼び出し間隔
const speedUp = 100; //レベル UP 時の呼び出し間隔短縮値
let highS = []; //high スコア用 2 次元配列[n][スコア,時分]

const BGM = new Audio('./tetris.mp3'); //音声オブジェクトの新規作成
BGM.loop = true; //繰返し再生指定

//ゲーム初期化
function initGame()
{
	//キャンバス
		canvas[0] = [3,3,3,3,3,3,3,3,3,3,3,3,3,3]; //0 行目の定義
		canvas[1] = [3,3,3,3,2,2,2,2,2,2,3,3,3,3]; //1 行目の定義
	for(var i=2;i<=4;i++)
		{ 	canvas[i] = [3,3,3,3,2,1,1,1,1,2,3,3,3,3]; } //2～4 行目の重複定義
		  	canvas[5] = [3,2,2,2,2,1,1,1,1,2,2,2,2,3]; //5 行目の定義
	for(var i=6;i<=25;i++)
		{ 	canvas[i] = fieldLine.concat(); } //6～25 行目の重複定義
			canvas[26] = [3,2,2,2,2,2,2,2,2,2,2,2,2,3]; //26 行目の定義
			canvas[27] = [3,3,3,3,3,3,3,3,3,3,3,3,3,3]; //27 行目の定義
		//テトリミノ情報
		mNum = parseInt( Math.random()*7 ); //テトリミノモデル番号
		next = parseInt( Math.random()*7 ); //NEXT テトリミノモデル番号
		
		cY = startY; 						//テトリミノ表示行
		cX = startX; 						//列
		ctx.strokeStyle = "black"; 			//枠線色
		//ゲーム制御
		gameID = ""; //ゲーム開始制御 ID クリア
		total = 0; //得点合計クリア
		level = 1; //ゲームレベル
		delTotal = 0; //削除行数合計
		speed = 700; //setInterval の関数 play 呼び出し間隔
		
		// BGM再生
	    BGM.currentTime = 0; //曲の開始位置を先頭に設定
	    BGM.playbackRate = 1; //再生速度を1に設定
	    
	}


//-------------------------
// キャンバス定義
//-------------------------
document.getElementById('name').innerHTML = "348_1211050_深瀬拓馬";

const can = document.getElementById('Canvas');
const ctx = can.getContext('2d');

can.setAttribute( "width" , CELL*14 );
can.setAttribute( "height", CELL*28 );
can.setAttribute( "style" , "outline:1px solid #000;" );
const score = document.getElementById('score'); //DOM ツリーのスコア表示 element のアドレス取得
const LEVEL = document.getElementById('level'); //レベル表示 element アドレス
const t1 = document.getElementById('t1'); //履歴（スコア）
const t2 = document.getElementById('t2'); //履歴（時刻）

//-------------------------
// 主処理
//-------------------------


//初期画面表示
initGame( );
drawCanvas( );
drawTetrimino(mNum, cY,cX);

function play()
{
	//テトリミノを下移動
	if( !collide( 1, 0 ) ) //下移動 NG なら
	{
		gameOver(); //終了画面表示
		BGM.pause(); // BGMを一時停止
	}
}
//-------------------------
// キーイベント
//-------------------------
document.onkeydown = function(e)
{
	console.log(e.keyCode);
	//ゲーム開始前なら
	if(gameID === "")
	{
		//[Enter]キーが押されたらテトリミノ自動落下開始
		if( e.keyCode == 13 )
		{	
			drawCanvas( );
			drawTetrimino( mNum, cY,cX );
			gameID = setInterval( play, 700 );
			
			LEVEL.innerHTML = level; //ゲーム開始・リプレイ時のレベル表示
			BGM.play(); // BGMを再生する
		}
	}
	
	//ゲーム開始後なら
	else 
	{
		switch(e.keyCode)
		{
			//collide( 行移動量, 列移動量 )
			case 37: collide( 0,-1 ); break; //左
			case 39: collide( 0, 1 ); break; //右
			case 40: play(); 		  break; //下

			case 32: if( mNum > 0 ) {rotate(); }  break; //テトリミノ回転
		}
	}
};
;


//-----------------
//-------------------------
// ゲーム画面描画
//-------------------------


//キャンバス描画
function drawCanvas( )
{
	for(var row=0;row<canvas.length;row++) //行ループ
	{
		for(var col=0;col<14;col++) //列ループ
		{
			//セル描画
			ctx.fillStyle = tetColor[ canvas[row][col] ];
			ctx.fillRect(CELL*col, CELL*row, CELL, CELL);

			//着地テトリミノなら枠線描画
			if( canvas[row][col] > 3 ){
			 ctx.strokeRect(CELL*col, CELL*row, CELL, CELL);
			 }
		}
	}
}

			
//テトリミノ描画
function drawTetrimino( n, y, x ) //（モデル配列番号,セル行,セル列）
{
	for(var i=0;i<4;i++) //４セルのループ
	{
		//セル描画
		ctx.fillStyle = tetColor[n+4];
		ctx.fillRect(CELL*(x+tetModel[n][i][1]), CELL*(y+tetModel[n][i][0]), CELL, CELL);
		
		//輪郭描画（セル左上 X 座標,Y 座標,輪郭パターン）
		drawOutline(CELL*(x+tetModel[n][i][1]), CELL*(y+tetModel[n][i][0]), tetModel[n][i][2]);
	}
}
//セルの輪郭描画
function drawOutline( x, y, ptn )
{
	var x1,y1; //線描画の起点座標
	var x2,y2; // 〃 終点座標
	//パターンの上位桁から順にチェック
	for(var i=3;i>=0;i--) //千,百,十,一の位
	{
		if( ptn/10**i >= 1 ) //最上位桁が 1 なら輪郭線描画
 		{
//輪郭線の起点座標(x1,y1)と終点座標(x2,y2)を算出
 switch(i){
                case 3: //左辺
                    x1=x; y1=y; x2=x; y2=y+CELL; break;
                case 2: //上辺
                    x1=x; y1=y; x2=x+CELL; y2=y; break;
                case 1: //右辺
                    x1=x+CELL; y1=y; x2=x+CELL; y2=y+CELL; break;
                case 0: //下辺
                    x1=x; y1=y+CELL; x2=x+CELL; y2=y+CELL; break;
            }
				ctx.beginPath(); //輪郭描画開始（パスのクリア）
				ctx.moveTo( x1, y1 ); //起点
				ctx.lineTo( x2, y2 ); //終点
				ctx.stroke( ); //描画
				//パターンから処理済み桁を削除
				ptn = ptn%10**i;
		}
	}
}


//-------------------------
// Tetrimino回転
//-------------------------


function rotate( )
{
	//回転用二次元配列宣言
	var tmpAry=[];
	
	//回転処理
	for(var i=0;i<4;i++) //４セルの行ループ
	{
		//回転可能なら
		if( canvas[cY+tetModel[mNum][i][1]][cX+(3-tetModel[mNum][i][0])] <= 1 )
		{
			//テトリミノ[行,列]=>回転用配列[回転前列,3-回転前行]
		   // 輪郭パターンを回転
            var ptn = tetModel[mNum][i][2].toString();
            while (ptn.length < 4) {
                ptn = "0" + ptn;  // 左側を0で埋める
            }
            ptn = ptn[3] + ptn.slice(0, 3);  // 最後の文字を最初に移動する
            // 更新された輪郭パターンを含む新しいセル位置を追加
            tmpAry.push([tetModel[mNum][i][1], 3 - tetModel[mNum][i][0], parseInt(ptn, 10)]);
        }
		//回転NGなら
		else
		{
			i = 4; //ループを強制終了
			tmpAry = []; //回転用配列を空に（回転成否のフラグに利用）
		}
	}
	//回転できる場合
	if( tmpAry.length )
	{
		//回転用配列をテトリミノ配列にコピー
		tetModel[mNum] = tmpAry;
	
		//回転後のテトリミノ描画
		drawCanvas( ); //回転前テトリミノを消すため
		drawTetrimino( mNum, cY,cX );

		//NEXTテトリミノ表示
		if( cY >= 6 )
		{	drawTetrimino( next, startY,startX );	}
	}
}


//-------------------------
// あたり判定
//-------------------------

//移動対象テトリミノの全表示セルが移動先に描画可能か否かを判定
function collide( y, x )
{
	var judge = true;	//移動可能をセット

	for(var i=0;i<4;i++)	//４セルのループ
	{
		if(	canvas[cY+tetModel[mNum][i][0]+y][cX+tetModel[mNum][i][1]+x] > 1 )	//移動先がcanvas描画禁止セルなら
		{
			judge = false;	//移動NGをセット
			i = 4;			//移動NGなのでループ処理を強制終了
		}
	}

	//移動可能なら
	if( judge )
	{
		//テトリミノの位置を変更
		cY += y;
		cX += x;

		drawCanvas( );					//キャンバス描画
		drawTetrimino( mNum,cY,cX );	//新座標でテトリミノ描画
		if( cY >= 6 )					//NEXTテトリミノ描画
		{	drawTetrimino( next, startY,startX );	}
	}
	//下移動NGなら
	else if( y == 1 )
	{
		//停止テトリミノ表示セルの色値をキャンバスにセット
		setCell( );
		total += level; //着地１回あたりの得点加算
		
		//ゲーム継続
		if( cY > 2 )
		{
			//削除行を退避
			delY = cY;
		
			//テトリミノをの位置を変更
			cY = startY;
			cX = startX;
	
			//次の落下テトリミノモデル番号
			//mNum = parseInt( Math.random()*7 );
			//NEXT番号を次の落下テトリミノ番号にコピー
			mNum = next;

			//新たなNEXT番号生成
		    next = parseInt( Math.random()*7 );
			//next = 1; //★デバッグ用
			//ゲーム終了判定に変数 judge を再利用
			judge = true;

			drawCanvas( );					//キャンバス描画
			drawTetrimino( mNum, cY,cX );	//新座標でテトリミノ描画
			//行削除
			lineDelete( );
		}
		score.innerHTML = total; //score 再表示
		//最高レベル未満でレベル UP 条件を満たしていたら
		if( level < levelMax && delTotal >= levelUpLine )
		{
			level++; //レベル UP
			LEVEL.innerHTML = level; //レベル再表示
			delTotal = 0; //レベル UP 判定用行数クリア

			clearInterval(gameID);	//起動済み常駐プロセスを停止
			speed -= speedUp;	//起動間隔短縮（スピード up）
			gameID = setInterval(play,speed);	//新たなスピードで常駐プロセス起動

			BGM.playbackRate = 1 + (level - 1) * 0.2; // BGM再生速度をレベルに合わせて調整
		}
	}		
	return judge; //ゲーム終了時のみ false がセットされる
}   



//-------------------------
// 着地Tetrimino色値セット
//-------------------------
function setCell( )
{
	//tetModel 配列の表示セルの色値を canvas 配列の該当セルにセット
	for(var i=0;i<4;i++) //４セルのループ
	{
		//「4」はtetModelとtetColorのoffset
		canvas[cY+tetModel[mNum][i][0]][cX+tetModel[mNum][i][1]] = mNum+4;
	}
}



//-------------------------
// 行削除
//-------------------------
function lineDelete( )
{
	//マーキングの色（60%透過の白色）
	ctx.fillStyle = "rgba(255,255,255,0.6)";
	
	var startC, lenC; //マーキング開始セル、マーキングセル数
	var del; //削除フラグ
	var delCnt = 0; //削除行数
	
	//削除行のマーキングおよび着地テトリミノ 4 行の canvas 配列行詰め
	for(var i=delY+3;i>=delY;i--)
	{
		if( i < 6 ){ startC=5; lenC=4; } //NEXT 領域内
		else{ startC=2; lenC=10; } //フィールド内
		//１行の全セルチェック
		del = true;
		for(var k=startC ;k<startC+lenC ;k++)
		{
			//canvas 配列値が 4 未満のセルはテトリミノではない
			if(canvas[i][k] < 4 ){ del = false; }
		}
		
		//削除すべき行なら（del==true)
		if( del )
		{
			ctx.fillRect(CELL*startC, CELL*i, CELL*lenC, CELL);	//削除行マーキング
			if( i >= 6 )	//フィールド内の行なら
			{	canvas[i] = fieldLine.concat();		}			//削除行の配列値をクリア

			else			//NEXT領域内の行なら
			{	for(var k=5;k<=8;k++){ canvas[i][k]=1; }	}	//5～8列を「1」に変更（NEXT領域の初期値）

			delCnt++;		          							//削除行数up

		}
    //削除行でなく、且つ削除済み行があれば
		else if( delCnt > 0 )
		{
			if( i >= 6 )	//フィールド内の行なら
			{
				canvas[i+delCnt] = canvas[i].concat();	//その行をdelCnt行下にコピー（行詰め）
				canvas[i] = fieldLine.concat();			//その行の配列値をクリア
			}
			else			//NEXT領域内の行なら
			{
				for(var k=5;k<=8;k++)	//NEXT領域の4列チェック
				{
					if( canvas[i][k] > 3 )		//テトリミノセルなら
					{
						canvas[i+delCnt][k] = canvas[i][k];	//セル値をdelCnt行下の同一列にコピー
						canvas[i][k] = 1;					//コピー元セルを「1」（NEXT領域初期値）
					}
				}
			}
		}
	}
	//削除行数に応じた得点加算
	total += delPoint[delCnt] * level;
	
	//レベル UP 判定用の削除行数加算
	delTotal += delCnt;


	//着地テトリミノより上の行詰め
	if(delCnt > 0) //削除した行があれば
	{
	for(var i=delY-1;i>=6;i--)//フィールド内の行詰め（着地テトリミノの 1 行上～6 行目まで下から順に処理）
	{
		canvas[i+delCnt] = canvas[i].concat(); //delCnt 行下にコピー（行詰め）
		canvas[i] = fieldLine.concat(); //その行の配列値をクリア	
	}
     	 //フィールド内完了後に NEXT 領域の行詰め
		var bottomY = 5; //NEXT 領域の底は 5 行目
		if( delY <= 5 ){ bottomY = delY-1; } //テトリミノが NEXT 領域内に着地した場合
		for(var i=bottomY;i>=2;i--) //行ループ
    	{
 			for(var k=5;k<=8;k++)
			{	
				if( canvas[i][k] > 3 ) //テトリミノセルなら
				{
					canvas[i+delCnt][k] = canvas[i][k]; //delCnt 行下にセル値をコピー
					canvas[i][k] = 1; //NEXT 領域値でクリア
				}
			}
		}
	}	
}


	

//-------------------------
// GAME OVER
//-------------------------

function gameOver( )
{
	//ゲーム終了
	clearInterval(gameID); //関数 play の繰り返し呼び出し停止
	//「GAME OVER」表示
	ctx.fillStyle = tetColor[3]; //背景色
	ctx.fillRect(CELL*3, CELL*10, CELL*8, CELL*3);
	ctx.strokeStyle = "red";
	ctx.strokeRect(CELL*3, CELL*10, CELL*8, CELL*3);
	ctx.font = "30px 'ＭＳ ゴシック'";
	ctx.textAlign = "center";
	ctx.fillStyle = "red";
	ctx.fillText("GAME OVER", CELL*7, CELL*12);
	//high スコア履歴に追加
	for(var i = 0; i < highS.length; i++) //履歴無しならループしない
	{
		if(total >= highS[i][0] ) //得点が履歴以上なら
		{
			highS.splice( i,0,[total,new Date()] ); //履歴追加 [i-1][得点,時刻]
			total = 0; //得点を履歴追加フラグに使う（0：追加済み）
		}
	}
	//履歴が 6 件を超えたら
	if(highS.length > 6 ){ highS.pop(); } //最低点を削除（pop は配列最終要素を削除）
	//履歴が 6 件未満で今回得点未追加なら（履歴に登録していない場合は total に得点がセットされている）
	if(highS.length < 6 && total > 0 )
	{ highS.push( [total,new Date()] ) } //履歴追加

	//high スコア表示
	t1.innerHTML = ""; //画面履歴クリア
	t2.innerHTML = "";
	for(var i=0;i<highS.length;i++)
	{
		t1.innerHTML += (highS[i][0]+"<br>");
		t2.innerHTML += ( highS[i][1].getHours() + ":" +
 		("0" + highS[i][1].getMinutes()).slice(-2) + "<br>" );
	}

	initGame( );

}


//-------------------------
// デバッグ
//-------------------------
/*
ctx.fillStyle = tetColor[4]; //塗りつぶし色
ctx.fillRect(0, 0, CELL, CELL); //矩形描画
ctx.strokeRect(0, 0, CELL, CELL); //枠線描画
*/
