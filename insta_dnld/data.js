const fs = require('fs');
const path = require('path');
const https = require('https');
const data = require('./data.json');

const arr = [];

function getImagesURLs(data, filename = 'newData') {
  try {
    if (!data) throw new Error('Must add data in json format');
    data
      .map(item =>
        item.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges.map(
          i => {
            const node = i.node;
            const isCarousel = node.carousel_media_count;
            const isVideo = node.video_versions;
            const name = node.caption.text
              .replace(/[\/:*?<>|"\n]/g, '')
              .substring(0, 240);
            if (isCarousel == null) {
              arr.push({
                name,
                url: node.image_versions2.candidates[0].url
              });
            } else {
              node.carousel_media.map((imgC, i) => {
                arr.push({
                  name: `${name}_${i + 1}`,
                  url: imgC.image_versions2.candidates[0].url
                });
              });
            }
            if (isVideo != null) {
              arr.push({
                name,
                url: node.video_versions[0].url
              });
            }
          }
        )
      )
      .flat();

    fs.writeFile(
      `${filename}.json`,
      JSON.stringify(arr, null, 2),
      'utf-8',
      err => {
        if (err) throw err;
        console.log('The file has been saved!');
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function downloadImgs(dirName = 'Images', data) {
  const url = [];

  data.map(i => {
    url.push(i.url);
  });

  if (!url) throw new Error('Must add image URLs in array');
  fs.mkdir(dirName, { recursive: true }, err => {
    if (err) throw err;
  });

  for (let i of url.keys()) {
    try {
      const cleanUrl = url[i].split('?')[0];
      const ext = path.basename(cleanUrl).split('.')[1];
      const imageName = data[i].name;

      // const imagePathName = `${dirName}/image_${i + 1}.${ext}`;
      const imagePathName = `${dirName}/${imageName}.${ext}`;
      const file = fs.createWriteStream(imagePathName);

      https
        .get(url[i], res => {
          res.pipe(file);

          file.on('finish', () => {
            file.close();
            console.log(`Image Download as ${imagePathName}`);
          });
        })
        .on('error', err => {
          fs.unlink(imagePathName);
          console.error(`Error downloading image: ${err.message}`);
        });
    } catch (error) {
      console.log('The Error', error);
    }
  }
}

// getImagesURLs(data, 'newData');
// downloadImgs('data', require('./newData.json'));
// getReels(require('./reelData.json'), 'updatedReelData');

function getReels(data, filename = 'updatedReelData') {
  try {
    if (!data) throw new Error('Must add data in json format');
    data
      .map(item =>
        item.data.xdt_api__v1__clips__user__connection_v2.edges.map(i => {
          const node = i.node;
          if (node.media.code) {
            arr.push(node.media.code);
          }
        })
      )
      .flat();

    let str = '';
    arr.map(data => {
      str += `https://www.instagram.com/reel/${data}/ `;
    });
    fs.writeFile(
      `${filename}.txt`,
      // arr.join(' '),
      str,
      'utf-8',
      err => {
        if (err) throw err;
        console.log('The file has been saved!');
      }
    );
  } catch (error) {
    console.log(error);
  }
}

const axios = require('axios');
async function getData(
  url = 'https://jsonplaceholder.typicode.com/todos/1',
  outputFilePath
) {
  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    const file = fs.createWriteStream(outputFilePath);

    res.data.pipe(file);

    return new Promise((resolve, reject) => {
      file.on('finish', resolve).on('error', reject);
    });
  } catch (err) {
    console.log(err);
  }
}

// getData(
//   'https://instagram.fccu10-1.fna.fbcdn.net/o1/v/t16/f1/m82/394DCCEAA378415A137EE6F05B34F6A8_video_dashinit.mp4?efg=eyJ4cHZfYXNzZXRfaWQiOjQyODg1MTcxMzE5MDI2OSwidmVuY29kZV90YWciOiJ4cHZfcHJvZ3Jlc3NpdmUuSU5TVEFHUkFNLkNMSVBTLkMzLjcyMC5kYXNoX2Jhc2VsaW5lXzFfdjEifQ\u0026_nc_ht=instagram.fccu10-1.fna.fbcdn.net\u0026_nc_cat=101\u0026vs=20fdf776c03a7a2b\u0026_nc_vs=HBksFQIYT2lnX3hwdl9yZWVsc19wZXJtYW5lbnRfcHJvZC8zOTREQ0NFQUEzNzg0MTVBMTM3RUU2RjA1QjM0RjZBOF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dHb25FeG9EZzlrZkc2OENBS3lScmJrMHhNNXhicV9FQUFBRhUCAsgBACgAGAAbAogHdXNlX29pbAExEnByb2dyZXNzaXZlX3JlY2lwZQExFQAAJvqltaC6gsMBFQIoAkMzLBdAJ0QYk3S8ahgSZGFzaF9iYXNlbGluZV8xX3YxEQB1_gcA\u0026ccb=9-4\u0026oh=00_AYAYBKJA4ltrxTbRW_CEWgj6v6dHeP2aN-WWN9DFMF81Hw\u0026oe=6748F051\u0026_nc_sid=1d576d',
//   path.resolve(__dirname, 'download-file.mp4')
// )
//   .then(() => console.log('success'))
//   .catch(err => console.log('failed'));
