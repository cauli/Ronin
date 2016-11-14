var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var ronin = new Ronin();
ronin.canvas.element = canvas;
ronin.overlay.element = canvas;







ronin.element = document.getElementById('ronin');
ronin.guides_element = document.getElementById('guides');
ronin.guides_context = ronin.guides_element.getContext('2d');


var brush = new Brush();




var commander = new Commander(document.getElementById("commander"),document.getElementById("commander_input"));

document.addEventListener('mousemove', function(e) {
  brush.draw(e);
}, false);

document.addEventListener('mousedown', function(e) {
  if(e.which != 1){ return; }
  brush.draw_start(e);
}, false);

document.addEventListener('mouseup', function(e) {
  brush.draw_stop(e);
}, false);

var keyboard = new Keyboard();
document.onkeyup = function myFunction(){ keyboard.listen(event); };

ronin.guides_context.imageSmoothingEnabled= false

/* brush experiments

var mirror_test = new Pointer();
mirror_test.mirror = new Position(200,10);
brush.add_pointer(mirror_test);

var mirror_test2 = new Pointer(new Position(0,10));
mirror_test2.mirror = new Position(200,0);
brush.add_pointer(mirror_test2);

brush.add_pointer(new Pointer(new Position(0,10)));

*/