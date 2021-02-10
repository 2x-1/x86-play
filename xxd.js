function unxxd(a) {
	// Hexdump string -> List of ord codes
	b = a.split("\n").map(i => {
		x = i.split("  ")[0].split(":")[1].slice(1).split(" ")
		x = x.map(y=>[y.slice(0,2),y.slice(2,4)]).join()
		return x;
	});
	b=b.join(",");
	return b.slice(0,b.length).split(",").map(i=>eval("0x"+i))
}

function xxd(a) {
	// List of ord codes -> hexdump string
	if(a.length==0) return "";
	counter = 0;
	output = "";
	line = "";
	chars = "";
	for(i=0;i<a.length;i++) {
		if(counter % 16 == 0) {
			x = counter.toString(16)
			line += "0".repeat(8-x.length)+x+": ";
		}
		q = a[i].toString(16)
		q = "0".repeat(2-q.length) + q
		line += q;
		if (32<=a[i]&&a[i]<=127)chars += String.fromCharCode(a[i]);
		else chars += ".";
		if((counter-1)%2==0)line += " ";
		++ counter;
		if(counter % 16 == 0) {
			output += line+" "+chars+"\n";
			line="";
			chars="";
		}
	}
	output += line+" ".repeat(40-line.split(": ")[1].length)+" "+chars+"\n";
	return output.slice(0,output.length-1)
}