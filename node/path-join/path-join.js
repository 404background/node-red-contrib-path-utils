const path = require('path');
const common = require('../common');

module.exports = function(RED) {
    const utils = common(RED);
    
    function PathJoinNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg, send, done) {
            // Node-RED 0.x compatibility
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) { node.error(err, msg); } };
            try {
                const parts = config.joinParts || [];
                const resolvedParts = parts.map(part => utils.getTypedInputValue(part.type, part.value, msg, node));
                const filteredParts = resolvedParts.filter(p => p != null && p !== '');
                
                if (filteredParts.length === 0) {
                    done("No valid path parts to join.");
                    return;
                }
                
                let result = path.join(...filteredParts);

                // Always normalize first
                result = path.normalize(result);

                // Apply output options
                const outputAs = config.outputAs || 'absolute';
                if (outputAs === 'absolute') {
                    result = path.resolve(result);
                } else if (outputAs === 'relative') {
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
    RED.nodes.registerType('path-join', PathJoinNode);
};
