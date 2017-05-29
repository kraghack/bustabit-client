/**
 * Backed on https://github.com/trevnorris/cbuffer
 */


export default class CBuffer {

	constructor(size) {
		this.length = 0;
		this.start = 0;

		this.data = new Array(size);
		this.size = size;
		this.end = size - 1;
	}

		/* mutator methods */
		// pop last item
		pop() {
			if (this.length === 0) return;
			let item = this.data[this.end];
			// remove the reference to the object so it can be garbage collected
			delete this.data[this.end];
			this.end = (this.end - 1 + this.size) % this.size;
			this.length--;
			return item;
		}

		// push item to the end
		push(item) {
			this.data[(this.end + 1) % this.size] = item;
			// recalculate length
			this.length = Math.min(this.length + 1, this.size);
			// recalculate end
			this.end = (this.end + 1) % this.size;
			// recalculate start
			this.start = (this.size + this.end - this.length + 1) % this.size;
			// return number current number of items in CBuffer
			return this.length;
		}

		pushArray(items) {
			let i = 0;
			for (; i < items.length; i++) {
				this.data[(this.end + i + 1) % this.size] = items[i];
			}
			// recalculate length
			this.length = Math.min(this.length + i, this.size);

			// recalculate end
			this.end = (this.end + i) % this.size;
			// recalculate start
			this.start = (this.size + this.end - this.length + 1) % this.size;
			// return number current number of items in CBuffer
			return this.length;
		}


		// remove and return first item
		shift() {
			// check if there are any items in CBuff
			if (this.length === 0) return;
			// store first item for return
			let item = this.data[this.start];
			// recalculate start of CBuffer
			this.start = (this.start + 1) % this.size;
			// decrement length
			this.length--;
			return item;
		}


		// add item to beginning of buffer
		unshift(item) {
			let i = 0;

			this.data[(this.size + this.start - 1) % this.size] = item;

			if (this.size - this.length < 0) {
				this.end += this.size - this.length;
				if (this.end < 0) this.end = this.size + (this.end % this.size);
			}
			if (this.length < this.size) {
				if (this.length > this.size)
					this.length = this.size;
				else
					this.length += i;
			}
			this.start -= arguments.length;
			if (this.start < 0) this.start = this.size + (this.start % this.size);
			return this.length;
		}

		// return specific index in buffer
		get(arg) {
			return this.data[(this.start + arg) % this.size];
		}


		// set value at specified index
		set(idx, arg) {
			return this.data[(this.start + idx) % this.size] = arg;
		}

		// return clean array of values
		toArray() {
			return this.slice();
		}

		// slice the buffer to an array
		slice(start, end) {
			let size = this.length;

			start = +start || 0;

			if (start < 0) {
				if (start >= end)
					return [];
				start = (-start > size) ? 0 : size + start;
			}

			if (end == null || end > size)
				end = size;
			else if (end < 0)
				end += size;
			else
				end = +end || 0;

			size = start < end ? end - start : 0;

			let result = Array(size);
			for (let index = 0; index < size; index++) {
				result[index] = this.data[(this.start + start + index) % this.size];
			}
			return result;
		}
}