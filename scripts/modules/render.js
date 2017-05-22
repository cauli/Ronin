function Render(rune)
{
  Module.call(this,rune);
  
  this.collection = {};

  this.collection["balance"] = new Filter_Balance();
  this.collection["grey"] = new Filter_Grey();
  this.collection["stencil"] = new Filter_Stencil();
  this.collection["invert"] = new Filter_Invert();
  this.collection["chromatic"] = new Filter_Chromatic();
  this.collection["sharpen"] = new Filter_Sharpen();
  this.collection["saturate"] = new Filter_Saturate();
  this.collection["contrast"] = new Filter_Contrast();
  
  this.hint = function(content)
  {
    var name = content.trim().replace(this.rune,"").trim().split(" ")[0];

    var h = "";
    if(this.collection[name]){
      for (i = 0; i < this.collection[name].parameters.length; i++) {
        h += this.collection[name].parameters[i].name+" ";
      }
    }
    else if(name){
      for (var key in this.collection){
        if(name != key.substr(0,name.length)){ continue; }
        h += key.substr(name.length)+" ";
      }  
    }
    else{
      for (var key in this.collection){
        h += key+" ";
      }  
    }
    return this.pad(content)+h;   
  }

}
