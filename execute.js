function execute(byteList) {
	// Firstly, convert byte List to bit stream.
	bitStream = byteList.map((i)=>i.toString(2)).map((x)=>"0".repeat(8-x.length)+x).join("")
	// Initialize (some of) the registers
	[_IP_, _CS_, _AX_, _BX_, _CX_, _DX_] = [0, 0x100, 0, 0, 0xFF, 0x100]
	
}