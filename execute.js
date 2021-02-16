function execute(byteList, debug="no_debug") {
	STDOUT = ""
	output = document.getElementById("output")
	output.innerHTML = ""
	REGLUT = ['AX', 'CX', 'DX', 'BX', 'SP', 'BP', 'SI', 'DI']

	// Firstly, convert byte List to bit list.

	memory = byteList.map((i)=>i.toString(2)).map((x)=>"0".repeat(8-x.length)+x)

	// Initialize memory
	// Initialize (some of) the registers
	REGS = {"IP":0, "CS":0, "AX":0, "BX":0}
	if(debug == "debug") {
		[REGS, memory] = oneStep(REGS, memory)
		output.innerHTML = "\n" + "AX=" + REGS["AX"]
	     				 + " BX=" + REGS["BX"]
					 + " CS=" + REGS["CS"]
					 + " IP=" + REGS["IP"] + "\n"

		console.log([REGS, memory])
	}
	else {
		while(memory[REGS["CS"] * 16 + REGS["IP"]] != undefined) {
			oneStep(REGS, memory)
		}
	}
}

function oneStep(REGS, memory, RUN_METHOD="run") {
	RealCodeAddr = REGS["CS"] * 16 + REGS["IP"];

	// Instruction width is guaranteed to be at least 1B
	WORD_LENGTH = 1
	// So we read this in
	
	console.log(memory[RealCodeAddr]) // debug

	Current = memory[RealCodeAddr]

	if(Current == undefined) // Special case
		return

	// Perform checks of the binary.

	if (Current.match(/^1011/)) { // MOV - imm
		w = Current[4]; reg = Current.slice(5,8)
		console.log(w, reg)
		if(w == 1) {
			// imm16 to register
			WORD_LENGTH = 3;
			REGS[REGLUT[parseInt(reg,2)]] = parseInt(memory.slice(RealCodeAddr+1, RealCodeAddr+3).join(""),2)
		}
		else {
			WORD_LENGTH = 2;
			console.log(memory.slice(RealCodeAddr+1, RealCodeAddr+2))
		}
	}
	REGS["IP"] += WORD_LENGTH
	return [REGS, memory]
}