import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import JsPdf from 'jspdf';
import html2canvas from 'html2canvas';

class ReactToPdf extends PureComponent {
  constructor(props) {
    super(props);
    this.toPrint = this.getCanvas.bind(this);
    this.toPdf = this.toPdf.bind(this);
    this.toPrint = this.toPrint.bind(this);
    this.targetRef = React.createRef();
  }

  getCanvas(width) {
    const { targetRef } = this.props;
    const source = targetRef || this.targetRef;
    const targetComponent = source.current || source;
    if (!targetComponent) {
      throw new Error(
        'Target ref must be used or informed. See https://github.com/ivmarcos/react-to-pdf#usage.'
      );
    }
    return html2canvas(targetComponent, {
      logging: false,
      useCORS: true,
      scale: this.props.scale,
      ...(width ? {width} : {})
    });
  }

  toPdf() {
    const { filename, x, y, options, onComplete } = this.props;
    this.getCanvas().then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new JsPdf(options);
      pdf.addImage(imgData, 'JPEG', x, y);
      pdf.save(filename);
      if (onComplete) onComplete();
    });
  }

  toPrint() {
    const { x, y, options, onComplete } = this.props;
    const pdf = new JsPdf(options);
    this.getCanvas(pdf.internal.pageSize.getWidth()).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg');
      pdf.addImage(imgData, 'JPEG', x, y, canvas.width, canvas.height);
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
      if (onComplete) onComplete();
    });
  }

  render() {
    const { children } = this.props;
    return children({ toPdf: this.toPdf, toPrint: this.toPrint, targetRef: this.targetRef });
  }
}

ReactToPdf.propTypes = {
  filename: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  options: PropTypes.shape({}),
  scale: PropTypes.number,
  children: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
  targetRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

ReactToPdf.defaultProps = {
  filename: 'download.pdf',
  options: undefined,
  x: 0,
  y: 0,
  scale: 1,
  onComplete: undefined,
  targetRef: undefined
};

export default ReactToPdf;
