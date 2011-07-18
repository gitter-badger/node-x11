var xutil = require('./xutil');

var valueMask = {
    CreateWindow: {
        backgroundPixmap: 0x00000001,
        backgroundPixel : 0x00000002,
        borderPixmap    : 0x00000004,
        borderPixel     : 0x00000008,
        bitGrawity      : 0x00000010,
        winGravity      : 0x00000020,
        backingStore    : 0x00000040,
        backingPlanes   : 0x00000080,
        backingPixel    : 0x00000100,
        overrideRedirect: 0x00000200,
        saveUnder       : 0x00000400,
        eventMask       : 0x00000800,
      doNotPropagateMask: 0x00001000,
        colormap        : 0x00002000,
        cursor          : 0x00004000
    },
    CreateGC: {
          'function'    : 0x00000001, // TODO: alias? _function?
           planeMask    : 0x00000002,
           foreground   : 0x00000004,
           background   : 0x00000008,
           lineWidth    : 0x00000010,
           lineStyle    : 0x00000020,
           capStyle     : 0x00000040,
           joinStyle    : 0x00000080,
           fillStyle    : 0x00000100,
           fillRule     : 0x00000200,
           tile         : 0x00000400,
           stipple      : 0x00000800,
           tileStippleXOrigin: 0x00001000,
           tileStippleYOrigin: 0x00002000,
           font         : 0x00004000,
           subwindowMode: 0x00008000,
           graphicsExposures: 0x00010000,
           clipXOrigin  : 0x00020000,
           clipYOrigin  : 0x00040000,
           clipMask     : 0x00080000,
           dashOffset   : 0x00100000,
           dashes       : 0x00200000,
           arcMode      : 0x00400000
    }
};

var valueMaskName = {};
for (var req in valueMask) {
    var masks = valueMask[req];
    var names = valueMaskName[req] = {};
    for (var m in masks) 
        names[masks[m]] = m;
}

function packValueMask(reqname, values)
{
    var bitmask = 0;
    var masksList = [];
    var reqValueMask = valueMask[reqname];
    var reqValueMaskName = valueMaskName[reqname];

    if (!reqValueMask)
        throw new Error(reqname + ': no value mask description');

    for (var v in values)
    {
        var valueBit = reqValueMask[v];
        if (!valueBit)
            throw new Error(reqname + ': incorrect value param ' + v);
        masksList.push(valueBit);
        bitmask |= valueBit;
    }
    masksList.sort();
    var args = [];
    for (m in masksList)
    {    
       valueName = reqValueMaskName[masksList[m]];
       args.push( values[valueName] );
    }
    return [bitmask, args]
}

/*

the way requests are described here

- outgoing request

   1) as function
   client.CreateWindow( params, params ) ->
       req = reqs.CreateWindow[0]( param, param );
       pack_stream.pack(req[0], req[1]);

   2) as array: [format, [opcode, request_length, additional known params]]
  
   client.MapWindow[0](id) ->
       req = reqs.MwpWindow;
       req[1].push(id);
       pack_stream.pack( req[0], req[1] );

- reply
  
*/

module.exports = {
   CreateWindow: [
       // create request packet - function OR format string
       function(id, parentId, x, y, width, height, borderWidth, _class, visual, values) {
<<<<<<< HEAD
           console.log('CreateWindow called', id);
=======
>>>>>>> 3d3658d0b81642440a915e706d2c28b412c1a383

           // TODO: ??? there is depth field in xproto, but xlib just sets it to zero
           var depth = 0;

           var packetLength = 8 + (values ? Object.keys(values).length : 0);
           // TODO: should be CCSLLssSSSSLL - x,y are signed
           var format = 'CCSLLSSSSSSLL';

           // create bitmask
           var bitmask = 0;
           // TODO: slice from function arguments?
           var args = [1, depth, packetLength, id, parentId, x, y, width, height, borderWidth, _class, visual];
           
           // TODO: the code is a little bit mess
           // additional values need to be packed in the following way:
           // bitmask (bytes #24 to #31 in the packet) - 32 bit indicating what adittional arguments we supply
           // values list (bytes #32 .. #32+4*num_values) in order of corresponding bits
         

           // TODO: replace with packValueMask
           var masksList = [];
           for (var v in values)
           {
               var valueBit = valueMask['CreateWindow'][v];
               if (!valueBit)
               {
                   throw new Error('CreateWindow: incorrect value param ' + v);
               }
               masksList.push(valueBit);
               bitmask |= valueBit;
               format += 'L';
           }
           // values packed in order of corresponding bit
           masksList.sort();
           // set bits to indicate additional values we are sending in this request
           args.push(bitmask);
           // add values in the order of the bits
           // TODO: maybe it's better just to scan all 32 bits anstead of sorting parameters we are actually have?
           for (m in masksList)
           {
              valueName = valueMaskName['CreateWindow'][masksList[m]];
              args.push( values[valueName] );
           }
           return [format, args];
       }

   ],

   MapWindow: [
       // 8 - opcode, 2 - length
       [ 'CxSL', [8, 2] ]
   ],

   UnmapWindow: [
       [ 'CxSL', [10, 2] ]
   ],

   // opcode 55
   CreateGC: [
       function(cid, drawable, values) {
           var format = 'CxSLL';           
           var packetLength = 8 + (values ? Object.keys(values).length : 0);
           var args = [55, packetLength, cid, drawable];
           var vals = packValueMask('CreateGC', values);
           args.push(vals[0]);     // values bitmask
           var valArr = vals[1];
           for (v in valArr)
           {
               format += 'L'; // TODO: we know format string length in advance and += inefficient for string
               args.push(valArr[v]);
           }           
           return [format, args];
        }
   ],

   // opcode 16
   InternAtom: [
       function (returnOnlyIfExist, value)
       {
           var padded = xutil.padded_string(value);
           return ['CCSSa', [16, returnOnlyIfExist ? 1 : 0, 2+padded.length/4, value.length, value] ];
       },

       function(stream, buf) {
           console.error('Intern Atom reply !!!!'); 
       }   
   ],

   GetAtomName: [
       [ 'CxSL', [17, 2] ],
       function(stream, buf) {
           console.error('Intern GetAtomName reply !!!!'); 
       }   
   ]
}