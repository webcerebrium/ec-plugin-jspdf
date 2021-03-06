import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Logger } from 'ec-react15-lib';
import * as commonPdfIndex from './../editable/jspdf';
import PdfGenerator from './PdfGenerator';

export const collectPdfImages = (tpl, context, callback) => {
  // TODO: go through the tree of image
  if (typeof callback === 'function') callback();
};

export const getPdfElementsList = (context) => {
  const ecOptions = context.globals.ecOptions;
  const elementsList = { ...commonPdfIndex.default };
  const plugin = ecOptions.plugins.find(p => (p.pluginName === 'jspdf'));
  Logger.of('TplPdfLoader.getPdfElementsList').info('plugin=', plugin);
  if (plugin) {
    const pdf = plugin.jspdf;
    Object.keys(pdf).forEach((k) => { elementsList[k] = pdf[k]; });
  }
  return elementsList;
};

export const renderPdfContainer = (gen, container, context) => {
  const elementsList = getPdfElementsList(context);
  container.forEach((props) => {
    // basically we are outlining container - where the component will be rendered
    const ctx = {
      ...context,
      x: gen.getX(),
      y: gen.getY(),
      width: gen.getDocWidth() - gen.margin.right - gen.getX(),
      height: gen.getDocHeight() - gen.margin.bottom - gen.getY()
    };
    if (typeof elementsList[props.type] === 'function') {
      Logger.of('TplPdfLoader.renderPdfContainer').info('props=', props);
      // there is no merged context, as chilren typically are PdfPage's
      ReactDOMServer.renderToString(React.createElement(elementsList[props.type], { gen, props, context: ctx }));
    } else {
      Logger.of('TplPdfLoader.renderPdfContainer').error('Cannot render PDF element of type', props.type);
    }
  });
};

export const generatePdf = (tpl, context, callback) => {
  // lets imagine all images are already loaded
  const gen = new PdfGenerator();
  collectPdfImages(tpl, context, () => {
    renderPdfContainer(gen, tpl, context);
    if (typeof callback === 'function') callback(gen, context);
  });
};

export default {
  generatePdf
};
