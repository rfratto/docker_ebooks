class MarkovChainer {
	constructor(order) {
		this.order = order
		this.beginnings = []
		this.freq = { }
	}

	// Pass a string with a terminator to the function to add it to the
	// markov lists.
	addSentence(string, terminator) {
		var words = string.split(" ")
		var buf = []
		var self = this

		if (words.length > this.order) {
			words.push(terminator)
			this.beginnings.push(0, words.slice(0, this.order))
		}

		words.forEach(function(word) {
			buf.push(word)

			if (buf.length === self.order + 1) {
				var mykey = [buf[0], buf[buf.length - 2]].toString()
				var freqVal = buf[buf.length - 1]

				if (mykey in self.freq) {
					self.freq[mykey].push(freqVal)
				} else {
					self.freq[mykey] = [freqVal]
				}

				buf.splice(0,1)
			}
		})
	}

	addText(text) {
		text = text.replace(/\n\s*\n/m, ".")
		var seps = /([.!?;:])/
		var pieces = text.split(seps)
		var sentence = ""
		var self = this

		pieces.forEach(function(piece) {
			if (piece !== "") {
				if (piece.search(seps) >= 0) {
					self.addSentence(sentence, piece)
					sentence = ""
				} else {
					sentence = piece
				}
			}
		})
	}

	randomChoice(arr) {
		return arr[Math.floor(Math.random() * arr.length)]
	}

	generateSentence() {
		var res = this.randomChoice(this.beginnings)

		if (res.length === this.order) {
			var nw = true

			while (nw !== null) {
				var restup = [res[res.length - 2], res[res.length - 1]].toString()
				nw = this.nextWordFor(restup)

				if (nw !== null) {
					res.push(nw)
				}
			}

			var new_res = res.slice(0, res.length - 2)

			if (new_res[0] !== '') {
				new_res[0] = new_res[0].charAt(0).toUpperCase() + new_res[0].slice(1)
			}

			var sentence = ""

			new_res.forEach(function(word) {
				sentence += word + " "
			})

			sentence += res[res.length - 2] + res[res.length - 1]
			return sentence
		} else {
			console.log('[INFO] Length of beginning did not match order.')
		}

		return null
	}

	nextWordFor(words) {
		var arr = this.freq[words]

		if (arr) {
			return this.randomChoice(arr)
		} else {
			return null
		}
	}
}

module.exports = MarkovChainer
