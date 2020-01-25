const FPS                       = 40;
const UPDATE_MILLISECONDS       = 1000 / FPS; // 1 second in ms / FPS
const GAME_UPDATE_TIME          = 6 * UPDATE_MILLISECONDS;
const WEST                      = 0;
const NORTH                     = 1;
const EAST                      = 2;
const SOUTH                     = 3;
const LEFT_KEY_CODE             = "ArrowLeft";
const UP_KEY_CODE               = "ArrowUp";
const RIGHT_KEY_CODE            = "ArrowRight";
const DOWN_KEY_CODE             = "ArrowDown";
const MUSIC_ON_OFF_KEY_CODE     = "KeyM";
const BACKGROUND_COLOR          = "MediumBlue";
const FRAME_COLOR               = "DeepPink";
const SNAKE_COLOR               = "MediumOrchid";
const DOT_COLOR                 = "Yellow";
const CELL_SIZE                 = 16; // Pixels
const START_LIVES               = 3;
const FONT_HEIGHT               = 14;
const FONT_NAME                 = "Arial";
const TEXT_FONT                 = FONT_HEIGHT + "px " + FONT_NAME;
const TEXT_COLOR                = "rgb(180, 180, 180)";
const HIGH_TEXT_COLOR           = "Red";
const PLAY_AGAIN_TEXT_COLOR     = "Bisque";
const STATE_PLAYING             = 0;
const STATE_FINISHED            = 1;

var Game = 
{
	snake: { squares: [] },
	dot: { position: {} },
	frame: {},
	audio: { }
};

function randomCoordinate()
{
	// First and last two rows (Nº 0 and Nº Game.rows-1) and columns (Nº 0 and Nº Game.columns-1) are used by frame.
	// Another extra row (Nº 1) for info text.
	// So they aren't availables.

	return {
		row: Math.floor( Math.random() * ( Game.rows - 3 ) + 2 ),
		column: Math.floor( Math.random() * ( Game.columns - 2 ) + 1 )
	};
}

function rowToPixel( row )
{
	return CELL_SIZE * row;
}

function columnToPixel( column )
{
	return CELL_SIZE * column;
}

function fillBackground()
{
	Game.context.fillStyle = BACKGROUND_COLOR;
	Game.context.fillRect( 0, 0, Game.canvasWidth, Game.canvasHeight );
}

function drawSnake( snake )
{
	Game.context.fillStyle = SNAKE_COLOR;

    for ( var i = 0; i < snake.squares.length; i++ )
	{
		Game.context.fillRect( columnToPixel( snake.squares[i].column ), rowToPixel( snake.squares[i].row ),
			CELL_SIZE, CELL_SIZE );
    }
}

function drawDot( dot )
{
	Game.context.fillStyle = DOT_COLOR;
	Game.context.fillRect( columnToPixel( dot.position.column ), rowToPixel( dot.position.row ),
		CELL_SIZE, CELL_SIZE );
}

function drawFrame()
{
	Game.context.beginPath();
	Game.context.lineWidth = CELL_SIZE;
	Game.context.strokeStyle = FRAME_COLOR;
	Game.context.rect( CELL_SIZE / 2, CELL_SIZE + CELL_SIZE / 2, Game.canvasWidth - CELL_SIZE,
		Game.canvasHeight - 2 * CELL_SIZE );
	Game.context.stroke();
}

function drawText()
{
	Game.context.textBaseline = 'top';
	Game.context.font = TEXT_FONT;
	Game.context.fillStyle = TEXT_COLOR;
	Game.context.fillText( 'Score: ' + Game.score, 0, 0 );
	var musicStr = 'M: Music ON/OFF';
	Game.context.fillText( musicStr, Game.canvasWidth / 4 - Game.context.measureText( musicStr ).width / 2, 0 );
	var livesStr = 'Lives: ' + Game.lives;
	Game.context.fillText( livesStr, Game.canvasWidth - Game.context.measureText( livesStr ).width, 0 );

	if (Game.score >= Game.highScore)
	{
		Game.context.fillStyle = HIGH_TEXT_COLOR;
	}

	Game.context.fillText( 'HI: ' + Game.highScore, ( Game.canvasWidth
		- Game.context.measureText( Game.highScore ).width) / 2, 0 );

	if ( Game.state == STATE_FINISHED )
	{
		Game.context.fillStyle = PLAY_AGAIN_TEXT_COLOR;
		Game.context.fillText( Game.startMessage, ( Game.canvasWidth
			- Game.context.measureText( Game.startMessage ).width) / 2, ( Game.canvasHeight - FONT_HEIGHT ) / 2 );
	}
}

function draw()
{
	fillBackground();
	drawFrame();
	drawText();

	if ( Game.state == STATE_PLAYING )
	{
		drawSnake( Game.snake );
		drawDot( Game.dot );
	}
}

function initFrame( frame, canvasWidth, canvasHeight )
{
	frame.left = CELL_SIZE;
	frame.top = 2 * CELL_SIZE;
	frame.right = canvasWidth - CELL_SIZE;
	frame.bottom = canvasHeight - CELL_SIZE;
}

function initSnake( snake, columns, rows )
{
	// Clear squares.
	snake.squares.length = 0;
	// Add head.
	snake.squares[0] = { row: rows / 2, column: columns / 2 };
	Game.snake.direction = EAST;
	Game.snake.dead = false;
	Game.snake.hit = false;
}

function spawnDot()
{
	var position = randomCoordinate();
	Game.dot.position.row = position.row;
	Game.dot.position.column = position.column;
}

function startMusic()
{
	if ( Game.playMusic && Game.audio.music.paused ) {
		Game.audio.music.loop = true;
		Game.audio.music.volume = .2;
		Game.audio.music.play();
	}
}

function stopMusic()
{
	Game.audio.music.pause();
	Game.audio.music.currentTime = 0;
}

function enableMusic( enable )
{
	Game.playMusic = enable;

	if ( Game.playMusic )
	{
		startMusic();
	}
	else
	{
		stopMusic();
	}
}

function init()
{
	document.addEventListener( "keydown", onKeyDown );
	var c = document.getElementById( "draw-surface" );
	Game.context = c.getContext( "2d" );
	Game.canvasWidth = c.offsetWidth;
	Game.canvasHeight = c.offsetHeight;
	Game.columns = Game.canvasWidth / CELL_SIZE;
	Game.rows = Game.canvasHeight / CELL_SIZE;
	Game.state = STATE_FINISHED;
	Game.ugt = 0;
	Game.lives = START_LIVES;
	Game.highScore = 0;
	Game.score = 0;
	Game.startMessage = 'PRESS ANY KEY TO PLAY';
	Game.playMusic = true;
	Game.audio.eat = new Audio( 'eat.mp3' );
	Game.audio.stroke = new Audio( 'stroke.mp3' );
	Game.audio.music = new Audio( 'music.mp3' );
	initFrame( Game.frame, Game.canvasWidth,	Game.canvasHeight );
	initSnake( Game.snake, Game.columns, Game.rows );
	spawnDot();
	draw();
	// Start game. Must be the last thing to do.
	Game.intervalID = setInterval( update, UPDATE_MILLISECONDS );
}

function restart()
{
	Game.state = STATE_PLAYING;
	Game.ugt = 0;
	Game.lives = START_LIVES;
	Game.score = 0;
	Game.startMessage = 'PRESS ANY KEY TO PLAY AGAIN';
	startMusic();
	initSnake( Game.snake, Game.columns, Game.rows );
	spawnDot();
}

function getHead( snake )
{
	return snake.squares[0];
}

function getTail( snake )
{
	if ( snake.squares.length > 0 )
	{
		return snake.squares[snake.squares.length - 1];
	}

	return null;
}

function isCollision2( x1, y1, w1, h1, x2, y2, w2, h2 )
{
	if ( x1 + w1 < x2 )
	{
		return false;
	}

	if ( x1 >= x2 + w2 )
	{
		return false;
	}

	if ( y1 + h1 < y2 )
	{
		return false;
	}

	if ( y1 >= y2 + h2 )
	{
		return false;
	}

	if ( x2 + w2 < x1 )
	{
		return false;
	}

	if ( x2 >= x1 + w1 )
	{
		return false;
	}

	if ( y2 + h2 < y1 )
	{
		return false;
	}

	if ( y2 >= y1 + h1 )
	{
		return false;
	}

	return true;
}

function isCollision( p1, p2, size )
{
	return isCollision2( columnToPixel( p1.column ), rowToPixel( p1.row ), size, size, columnToPixel( p2.column ),
		rowToPixel( p2.row ), size, size );
}

function isFrameCollision2( x, y )
{
	if ( x < Game.frame.left )
	{
		return true;
	}

	if ( y < Game.frame.top )
	{
		return true;
	}

	if ( x + CELL_SIZE > Game.frame.right )
	{
		return true;
	}

	if ( y + CELL_SIZE > Game.frame.bottom )
	{
		return true;
	}

	return false;
}

function isFrameCollision( p )
{
	return isFrameCollision2( columnToPixel( p.column ), rowToPixel( p.row ) );
}

function autoCollision( snake, head )
{
	for ( var i = 0; i < snake.squares.length; i++ )
	{
		var s = snake.squares[i];

		if ( s == head )
		{
			continue;
		}

		if ( isCollision( head, s, CELL_SIZE ) )
		{
			return true;
		}
	}

	return false;
}

function updatePosition( snake, dx, dy )
{
	for ( var i = snake.squares.length - 1; i >= 0; i-- )
	{
		var current = snake.squares[i];

		if ( i > 0 )
		{
			var previous = snake.squares[i - 1];
			current.row = previous.row;
			current.column = previous.column;
		}
		else
		{
			// Here 'i' equals zero and 'current' is the head.
			current.row += dy;
			current.column += dx;
		}
	}
}

function addSquare( snake, dx, dy )
{
	var tail = getTail( snake );
	snake.squares.push( { row: tail.row - dy, column: tail.column - dx } );
}

function updateSnake( snake )
{
	var dx = 0, dy = 0;

	switch ( snake.direction )
	{
		case WEST:
			dx = -1;
			break;

		case NORTH:
			dy = -1;
			break;

		case EAST:
			dx = 1;
			break;

		case SOUTH:
			dy = 1;
			break;
	}

	updatePosition( snake, dx, dy );

	var head = getHead( snake );

	snake.hit = isCollision( head, Game.dot.position, CELL_SIZE );

	if ( snake.hit )
	{
		addSquare(snake, dx, dy);
	}
	else
	{
		// It's only necessary to check if the head collided.
		snake.dead = isFrameCollision( head ) || autoCollision( snake, head );
	}
}

function update()
{
	Game.ugt += UPDATE_MILLISECONDS;

	if ( Game.ugt >= GAME_UPDATE_TIME )
	{
		if ( Game.state == STATE_PLAYING )
		{
			updateSnake( Game.snake );

			if ( Game.snake.hit )
			{
				Game.audio.eat.play();
				Game.score++;

				if ( Game.score > Game.highScore )
				{
					Game.highScore = Game.score;
				}

				spawnDot();
			}
			else if ( Game.snake.dead )
			{
				Game.audio.stroke.play();
				Game.lives--;

				if ( Game.lives == 0 )
				{
					Game.state = STATE_FINISHED;
					stopMusic();
				}
				else
				{
					initSnake( Game.snake, Game.columns, Game.rows );
					spawnDot();
				}
			}
		}

		Game.ugt = 0;
	}

	// Draw frame.
	draw();
}

function getOpposite( direction )
{
    switch ( direction ) {
        case WEST: return EAST;
        case NORTH: return SOUTH;
        case EAST: return WEST;
        case SOUTH: return NORTH;
    }
}

function checkDirection( snake, direction )
{
	// Can't go to the opposite current direction or the same current direction.

	if ( snake.direction != direction && direction != getOpposite( snake.direction ) )
	{
		snake.direction = direction;
	}
}

function onKeyDown( e )
{
	if ( !e.repeat )
	{
		switch ( Game.state )
		{
			case STATE_PLAYING:
				switch ( e.code ) {
					case LEFT_KEY_CODE:
						checkDirection( Game.snake, WEST );
						break;

					case UP_KEY_CODE:
						checkDirection( Game.snake, NORTH );
						break;

					case RIGHT_KEY_CODE:
						checkDirection( Game.snake, EAST );
						break;

					case DOWN_KEY_CODE:
						checkDirection( Game.snake, SOUTH );
						break;

					case MUSIC_ON_OFF_KEY_CODE:
						enableMusic( !Game.playMusic );
						break;
				}

				break;

			case STATE_FINISHED:
				restart();
				break;
		}
	}
}

function onLoad()
{
	init();
}

function onUnload()
{
	clearInterval( Game.intervalID );
}

