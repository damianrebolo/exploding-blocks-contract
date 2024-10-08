import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

//   0  1  2  3  4  5  6  7  8
//0 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//1 [ ][1][ ][ ][4][ ][ ][7][ ]
//2 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//3 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//4 [ ][2][ ][ ][5][ ][ ][8][ ]
//5 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//6 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
//7 [ ][3][ ][ ][6][ ][ ][9][ ]
//8 [ ][ ][ ][ ][ ][ ][ ][ ][ ]
type AdjacentIndices = {
  [key: string]: number[]; // Each key is a string, and the value is an array of numbers
};
const nextTo: AdjacentIndices = {
  "0": [8, 1, 72, 9],
  "1": [0, 2, 73, 10],
  "2": [1, 3, 74, 11],
  "3": [2, 4, 75, 12],
  "4": [3, 5, 76, 13],
  "5": [4, 6, 77, 14],
  "6": [5, 7, 78, 15],
  "7": [6, 8, 79, 16],
  "8": [7, 0, 80, 17],
  "9": [17, 10, 0, 18],
  "10": [9, 11, 1, 19],
  "11": [10, 12, 2, 20],
  "12": [11, 13, 3, 21],
  "13": [12, 14, 4, 22],
  "14": [13, 15, 5, 23],
  "15": [14, 16, 6, 24],
  "16": [15, 17, 7, 25],
  "17": [16, 9, 8, 26],
  "18": [26, 19, 9, 27],
  "19": [18, 20, 10, 28],
  "20": [19, 21, 11, 29],
  "21": [20, 22, 12, 30],
  "22": [21, 23, 13, 31],
  "23": [22, 24, 14, 32],
  "24": [23, 25, 15, 33],
  "25": [24, 26, 16, 34],
  "26": [25, 18, 17, 35],
  "27": [35, 28, 18, 36],
  "28": [27, 29, 19, 37],
  "29": [28, 30, 20, 38],
  "30": [29, 31, 21, 39],
  "31": [30, 32, 22, 40],
  "32": [31, 33, 23, 41],
  "33": [32, 34, 24, 42],
  "34": [33, 35, 25, 43],
  "35": [34, 27, 26, 44],
  "36": [44, 37, 27, 45],
  "37": [36, 38, 28, 46],
  "38": [37, 39, 29, 47],
  "39": [38, 40, 30, 48],
  "40": [39, 41, 31, 49],
  "41": [40, 42, 32, 50],
  "42": [41, 43, 33, 51],
  "43": [42, 44, 34, 52],
  "44": [43, 36, 35, 53],
  "45": [53, 46, 36, 54],
  "46": [45, 47, 37, 55],
  "47": [46, 48, 38, 56],
  "48": [47, 49, 39, 57],
  "49": [48, 50, 40, 58],
  "50": [49, 51, 41, 59],
  "51": [50, 52, 42, 60],
  "52": [51, 53, 43, 61],
  "53": [52, 45, 44, 62],
  "54": [62, 55, 45, 63],
  "55": [54, 56, 46, 64],
  "56": [55, 57, 47, 65],
  "57": [56, 58, 48, 66],
  "58": [57, 59, 49, 67],
  "59": [58, 60, 50, 68],
  "60": [59, 61, 51, 69],
  "61": [60, 62, 52, 70],
  "62": [61, 54, 53, 71],
  "63": [71, 64, 54, 72],
  "64": [63, 65, 55, 73],
  "65": [64, 66, 56, 74],
  "66": [65, 67, 57, 75],
  "67": [66, 68, 58, 76],
  "68": [67, 69, 59, 77],
  "69": [68, 70, 60, 78],
  "70": [69, 71, 61, 79],
  "71": [70, 63, 62, 80],
  "72": [80, 73, 63, 0],
  "73": [72, 74, 64, 1],
  "74": [73, 75, 65, 2],
  "75": [74, 76, 66, 3],
  "76": [75, 77, 67, 4],
  "77": [76, 78, 68, 5],
  "78": [77, 79, 69, 6],
  "79": [78, 80, 70, 7],
  "80": [79, 72, 71, 8],
} as AdjacentIndices;

describe("Exploding Blocks - Deploy Instances", function () {
  async function deployFactory() {
    const [_] = await hre.ethers.getSigners();

    const ExplodingBlocksHelpers = await hre.ethers.getContractFactory(
      "ExplodingBlocksHelperTest"
    );

    const explodingBlocksHelpers = await ExplodingBlocksHelpers.deploy();

    return {
      explodingBlocksHelpers,
      _,
    };
  }

  it("Should block be next to", async function () {
    const { explodingBlocksHelpers, _ } = await loadFixture(deployFactory);

    for (const property in nextTo) {
      const values: number[] = nextTo[property];
      for await (const value of values) {
        const result = await explodingBlocksHelpers.isBlockNextToTheOther(
          Number(property),
          value
        );
        expect(result).to.be.true;
      }
    }
  });
});
