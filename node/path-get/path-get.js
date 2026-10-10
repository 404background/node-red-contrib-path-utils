const path = require('path');
const common = require('../common');

module.exports = function(RED) {
    const utils = common(RED);
    
    function PathGetNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg, send, done) {
            // Node-RED 0.x compatibility
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) { node.error(err, msg); } };
            try {
                let inputPath;
                
                // Handle special case for cwd type
                if (config.inputType === 'cwd') {
                    inputPath = process.cwd();
                } else {
                    inputPath = utils.getTypedInputValue(config.inputType || 'msg', config.input || 'payload', msg, node);
                    if (typeof inputPath !== 'string') {
                        done("Input path is not a string.");
                        return;
                    }
                }

                const normalizedPath = path.normalize(inputPath);
                const getItem = config.getItem || 'dirname';
                
                let result;
                switch (getItem) {
                    case 'dirname':
                        // Special case: if input is cwd and getting dirname, return the cwd itself
                        if (config.inputType === 'cwd') {
                            result = normalizedPath;
                        } else {
                            result = path.dirname(normalizedPath);
                        }
                        break;
                    case 'basename':
                        result = path.basename(normalizedPath);
                        break;
                    case 'extname':
                        result = path.extname(normalizedPath);
                        break;
                    case 'filename':
                        result = path.basename(normalizedPath, path.extname(normalizedPath));
                        break;
                    default:
                        done("Invalid get item: " + getItem);
                        return;
                }

                // Always normalize first
                result = path.normalize(result);

                // Apply output options (only for dirname)
                const outputAs = config.outputAs || 'absolute';
                if (getItem === 'dirname' && outputAs === 'absolute') {
                    result = path.resolve(result);
                } else if (getItem === 'dirname' && outputAs === 'relative') {
                    const relativeTo = utils.getTypedInputValue(config.relativeToType || 'str', config.relativeTo, msg, node);
                    if (typeof relativeTo !== 'string') {
                        done("Base directory for relative path is not a string.");
                        return;
                    }
                    result = path.relative(relativeTo, result);
                }

                utils.setOutputValue(config.outputPropertyType || 'msg', config.outputProperty || 'payload', result, msg, node);
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        });
    }
    RED.nodes.registerType('path-get', PathGetNode);
};
