"use strict";

function walk(node) 
{
	// I stole this function from here:
	// http://is.gd/mwZp7E
	var child, next;

	switch ( node.nodeType )  
	{
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while ( child ) 
			{
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;

		case 3: // Text node
			node.nodeValue = handleText(node.nodeValue);
			break;
	}
}

function matchCaseOfLeft(left, right)
{
  var capitalise = function(x) {
    var firstAlphaIdx = x.search(/[a-z]/i);;
    if (firstAlphaIdx == -1 ) return x;
    return x.substring(0, firstAlphaIdx) + x.charAt(firstAlphaIdx).toUpperCase() + x.substring(firstAlphaIdx + 1);
  };
  var isCapitalised = function(x) {
    return x == capitalise(x);
  }
  var leftCapitalisedCount = left.reduce(function(count, part){
    return isCapitalised(part) ? count + 1 : count;
  }, 0);

  // Capitalise as many words on the right as there are capitalised on the left.
  // Special case: if left is all-caps, then capitalise all of the right.
  var leftAllCaps = (leftCapitalisedCount == left.length)
  return right.map(function(rightWord, idx) {
    var shouldCaps = (left[idx] ? isCapitalised(left[idx]) : leftAllCaps);
    return shouldCaps ? capitalise(rightWord) : rightWord;
  });
}

function handleText(value) {
  var mappings = [
    [ "debate",             function()  { return ["dance","-","off"] }],
    [ "self([- ])driving",  function(d) { return ["uncontrollably",d,"swerving"] }],
    [ "poll(ing)?",               function()  { return ["psychic"," ","reading"] }],
    [ "candidate",          function()  { return ["airbender"] }],
    [ "drone",              function()  { return ["dog"] }],
    [ "vows to",            function()  { return ["probably"," ","won't"] }],
    [ "at large",           function()  { return ["very"," ","large"] }],
    [ "successfully",       function()  { return ["suddenly"] }],
    [ "expands",            function()  { return ["physically"," ","expands"] }],
    [ "an unknown number",  function()  { return ["like"," ","hundreds"] }],
    [ "front([- ])runner",  function(d) { return ["blade",d,"runner"] }],
    [ "global",             function()  { return ["spherical"] }],
    [ "years",              function()  { return ["minutes"] }], // Doing the inverse is way too annoying to pull off.
    [ "no indication",      function()  { return ["lots"," ","of"," ","signs"] }],
    [ "horsepower",         function()  { return ["tons"," ","of"," ","horsemeat"] }],
    [ "urged restraint by", function()  { return ["drunkenly"," ","egged"," ","on"] }],
    [ "(?:first|second|third)([- ])degree", function(d) { return ["friggin'"," ","awful"] }]
  ];

  return mappings.reduce(function(result, mapping) {
    var left = mapping[0];
    var right = mapping[1];

    return result.replace(new RegExp(left, 'ig'), function(){ //match){
      // Ignore first argument (match) and last two arguments (replacement location, full string)
      var args = Array.prototype.slice.call(arguments, 0);
      var match = args[0];
      var refs = args.splice(1, (args.length - 3));

      var substituted = right.apply(null, refs); // Run the replacement function with any potential replacements from the left.
      return matchCaseOfLeft(match.split(/\b/), substituted).join(''); // Replace the left with the matched-caps right.
    });
  }, value);
}

if (typeof root == 'undefined') {
  // Chrome plugin
  walk(document.body);
} else {
  // We're inside Node.js
  module.exports = { handleText: handleText };
}

// Testing (TODO: doctest)
// Try:
//   require('./Source/content_script').handleText("No Indication of Horsepower: Today's debate featuring self-Driving cars sent an unknown number of Drone candidates to successfully expand their global polling numbers. The first-degree front-runner still remains at large.");
// Expect:
//   "Lots Of Signs of Tons Of Horsemeat: Today's dance-off featuring uncontrollably-Swerving cars sent like hundreds of Dog airbenders to suddenly expand their spherical psychic reading numbers. The friggin' awful blade-runner still remains very large."

