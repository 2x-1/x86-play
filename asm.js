function analyze(args) {
	// Detect the type inside the arguments.
	args = args.replace(", ",",")
	return args.split(",").map((i) => {
		if(i[1]=="X")
			return i
		else
			return eval(i)
	})
}

lookup = {"AX": "000","CX": "001",
	          "DX": "010","BX": "011",
	          "SP": "100","BP": "101",
	          "SI": "110","DI": "111"}

function regEncode(w, reg) {
	if(w == "1") return lookup[reg]
	else return null
}

function asm(s) {
	// Outputs a list of assembled integer byte values.
	if(s.length==0)return [];
	a = s.toUpperCase().split("\n")
	bitcode = ""
	for(i=0;i<a.length;i++) {
		b = a[i].match(/(([A-Fa-f0-9]+[ \t])*)?(.*)(\;.*)?/)[3];
		b = b.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g," ")
		q = b.split(' ')[0].toUpperCase()
		args = analyze(b.toUpperCase().split(" ").slice(1).join(" "))
		if(q == 'MOV') {
			bitcode += "1011" // So far we only need to handle load imm.
			w = "1"           // With AX, BX, CX, DX, etc.
			bitcode += w
			// Now, what's the register?
			bitcode += regEncode(w, args[0])
			literal = args[1].toString(2)
			// Pad literal with 0's
			bitcode += "0".repeat(16-literal.length) + literal
		} else {
			console.log("other")
		}
		// bitcode += "\n"
	}
	bitcode = bitcode.replace(/(\d)(?=(?:\d{8})+$)/g,"$1 ").split(" ")
	bytecode = bitcode.map((i)=>parseInt(i,2))
	return bytecode
}

function Listing(code) {
	// Produces an "instruction listing" with bytecode on the side
	SPLITTED_CODE=code.toUpperCase().split("\n")
	OUTPUT = "";
	for(TMP=0;TMP<SPLITTED_CODE.length;TMP++) {
		console.log(SPLITTED_CODE[TMP])
		result = asm(SPLITTED_CODE[TMP]).map((xx) => {
			x=xx.toString(16).length;
			return "0".repeat(2-x)+xx.toString(16).toUpperCase()
		}).join(" ")
		
		OUTPUT += result + " ".repeat(18 - result.length) + SPLITTED_CODE[TMP] + '\n'
	}
	console.log(SPLITTED_CODE)
	return OUTPUT
}

function disasm(s) {
	// TODO
}