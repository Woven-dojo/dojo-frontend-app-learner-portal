import { MockFactory } from './MockFactory';

export class IndexFactory extends MockFactory {
  index = 0;

  constructor(createFromIndex) {
    super();
    this.createFromIndex = createFromIndex;
  }

  create() {
    const result = this.createFromIndex ? this.createFromIndex(this.index) : this.index;

    this.index++;

    return result;
  }
}
