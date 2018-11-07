define(["require", "exports", "./position", "./base", "./util"], function (require, exports, position_1, base_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Annotation = position_1.Annotation;
    const STAR_POINTS = {
        [base_1.BoardSize.Nine]: [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]],
        [base_1.BoardSize.Nineteen]: [[3, 3], [3, 9], [3, 15],
            [9, 3], [9, 9], [9, 15],
            [15, 3], [15, 9], [15, 15]],
    };
    class Layer {
        constructor() {
            this._show = true;
        }
        get show() {
            return this._show;
        }
        set show(x) {
            if (x != this._show) {
                this._show = x;
                this.board.draw();
            }
        }
        addToBoard(board) {
            this.board = board;
            this.boardToCanvas = board.boardToCanvas.bind(board);
        }
    }
    exports.Layer = Layer;
    class StaticLayer extends Layer {
        clear() { }
        update(dataObj) {
            return false;
        }
    }
    class DataLayer extends Layer {
        getData(obj, propName) {
            let prop = obj[propName];
            if (prop === undefined) {
                return undefined;
            }
            return prop;
        }
    }
    class Grid extends StaticLayer {
        constructor() {
            super(...arguments);
            this.style = '#864';
        }
        draw() {
            let starPointRadius = Math.min(4, Math.max(this.board.stoneRadius / 5, 2.5));
            let ctx = this.board.ctx;
            let pr = util_1.pixelRatio();
            ctx.strokeStyle = this.style;
            ctx.lineWidth = pr;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (let i = 0; i < base_1.N; ++i) {
                let left = this.boardToCanvas(i, 0);
                let right = this.boardToCanvas(i, base_1.N - 1);
                let top = this.boardToCanvas(0, i);
                let bottom = this.boardToCanvas(base_1.N - 1, i);
                ctx.moveTo(0.5 + Math.round(left.x), 0.5 + Math.round(left.y));
                ctx.lineTo(0.5 + Math.round(right.x), 0.5 + Math.round(right.y));
                ctx.moveTo(0.5 + Math.round(top.x), 0.5 + Math.round(top.y));
                ctx.lineTo(0.5 + Math.round(bottom.x), 0.5 + Math.round(bottom.y));
            }
            ctx.stroke();
            ctx.fillStyle = this.style;
            ctx.strokeStyle = '';
            for (let p of STAR_POINTS[base_1.N]) {
                let c = this.boardToCanvas(p[0], p[1]);
                ctx.beginPath();
                ctx.arc(c.x + 0.5, c.y + 0.5, starPointRadius * pr, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    exports.Grid = Grid;
    class Label extends StaticLayer {
        draw() {
            let ctx = this.board.ctx;
            let textHeight = Math.floor(0.6 * this.board.stoneRadius);
            ctx.font = `${textHeight}px sans-serif`;
            ctx.fillStyle = '#9d7c4d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            for (let i = 0; i < base_1.N; ++i) {
                let c = this.boardToCanvas(-0.66, i);
                ctx.fillText(base_1.COL_LABELS[i], c.x, c.y);
            }
            ctx.textBaseline = 'top';
            for (let i = 0; i < base_1.N; ++i) {
                let c = this.boardToCanvas(base_1.N - 0.33, i);
                ctx.fillText(base_1.COL_LABELS[i], c.x, c.y);
            }
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            for (let i = 0; i < base_1.N; ++i) {
                let c = this.boardToCanvas(i, -0.66);
                ctx.fillText((base_1.N - i).toString(), c.x, c.y);
            }
            ctx.textAlign = 'left';
            for (let i = 0; i < base_1.N; ++i) {
                let c = this.boardToCanvas(i, base_1.N - 0.33);
                ctx.fillText((base_1.N - i).toString(), c.x, c.y);
            }
        }
    }
    exports.Label = Label;
    class Caption extends StaticLayer {
        constructor(caption) {
            super();
            this.caption = caption;
        }
        draw() {
            let ctx = this.board.ctx;
            let textHeight = Math.floor(0.8 * this.board.stoneRadius);
            ctx.font = `${textHeight}px sans-serif`;
            ctx.fillStyle = '#9d7c4d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            let c = this.boardToCanvas(base_1.N - 0.45, (base_1.N - 1) / 2);
            ctx.fillText(this.caption, c.x, c.y);
        }
    }
    exports.Caption = Caption;
    class HeatMap extends DataLayer {
        constructor(dataPropName, colorizeFn) {
            super();
            this.dataPropName = dataPropName;
            this.colorizeFn = colorizeFn;
            this.colors = null;
        }
        clear() {
            if (this.colors) {
                this.colors = null;
                this.board.draw();
            }
        }
        update(dataObj) {
            let data = this.getData(dataObj, this.dataPropName);
            if (data === undefined) {
                return false;
            }
            this.colors = data != null ? this.colorizeFn(data) : null;
            return true;
        }
        draw() {
            if (!this.colors) {
                return;
            }
            let ctx = this.board.ctx;
            let w = this.board.pointW;
            let h = this.board.pointH;
            let stones = this.board.stones;
            let p = { row: 0, col: 0 };
            let i = 0;
            for (p.row = 0; p.row < base_1.N; ++p.row) {
                for (p.col = 0; p.col < base_1.N; ++p.col) {
                    let rgba = this.colors[i];
                    if (stones[i++] != base_1.Color.Empty) {
                        continue;
                    }
                    ctx.fillStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]}`;
                    let c = this.boardToCanvas(p.row, p.col);
                    ctx.fillRect(c.x - 0.5 * w, c.y - 0.5 * h, w, h);
                }
            }
        }
    }
    exports.HeatMap = HeatMap;
    class StoneBaseLayer extends DataLayer {
        constructor(alpha) {
            super();
            this.alpha = alpha;
            this.blackStones = [];
            this.whiteStones = [];
        }
        clear() {
            if (this.blackStones.length > 0 || this.whiteStones.length > 0) {
                this.blackStones = [];
                this.whiteStones = [];
                this.board.draw();
            }
        }
        draw() {
            this.board.drawStones(this.blackStones, base_1.Color.Black, this.alpha);
            this.board.drawStones(this.whiteStones, base_1.Color.White, this.alpha);
        }
    }
    class BoardStones extends StoneBaseLayer {
        constructor() {
            super(1);
        }
        update(dataObj) {
            let stones = this.getData(dataObj, 'stones');
            if (stones === undefined) {
                return false;
            }
            this.blackStones = [];
            this.whiteStones = [];
            if (stones != null) {
                let i = 0;
                for (let row = 0; row < base_1.N; ++row) {
                    for (let col = 0; col < base_1.N; ++col) {
                        let color = stones[i++];
                        if (color == base_1.Color.Black) {
                            this.blackStones.push({ row: row, col: col });
                        }
                        else if (color == base_1.Color.White) {
                            this.whiteStones.push({ row: row, col: col });
                        }
                    }
                }
            }
            return true;
        }
    }
    exports.BoardStones = BoardStones;
    class Variation extends StoneBaseLayer {
        constructor(dataPropName, alpha = 0.4) {
            super(alpha);
            this.dataPropName = dataPropName;
            this._childVariation = null;
            this.blackLabels = [];
            this.whiteLabels = [];
        }
        get childVariation() {
            return this._childVariation;
        }
        set childVariation(p) {
            if (!base_1.movesEqual(p, this._childVariation)) {
                this._childVariation = p;
                this.board.draw();
            }
        }
        clear() {
            super.clear();
            this.blackLabels = [];
            this.whiteLabels = [];
            this.childVariation = null;
        }
        update(dataObj) {
            let variation = this.getData(dataObj, this.dataPropName);
            if (variation === undefined) {
                return false;
            }
            this.parseVariation(variation);
            return true;
        }
        parseVariation(variation) {
            let toPlay = this.board.toPlay;
            this.blackStones = [];
            this.whiteStones = [];
            this.blackLabels = [];
            this.whiteLabels = [];
            if (variation == null || variation.length == 0) {
                return;
            }
            if (!base_1.movesEqual(variation[0], this.childVariation)) {
                return;
            }
            let playedCount = new Uint16Array(base_1.N * base_1.N);
            let firstPlayed = [];
            toPlay = base_1.otherColor(toPlay);
            for (let i = 0; i < variation.length; ++i) {
                let move = variation[i];
                toPlay = base_1.otherColor(toPlay);
                if (move == 'pass' || move == 'resign') {
                    continue;
                }
                let idx = move.row * base_1.N + move.col;
                let label = { p: move, s: (i + 1).toString() };
                let count = ++playedCount[idx];
                if (toPlay == base_1.Color.Black) {
                    this.blackStones.push(move);
                    if (count == 1) {
                        this.blackLabels.push(label);
                    }
                }
                else {
                    this.whiteStones.push(move);
                    if (count == 1) {
                        this.whiteLabels.push(label);
                    }
                }
                if (count == 1) {
                    firstPlayed[idx] = label;
                }
                else if (count == 2) {
                    firstPlayed[idx].s += '*';
                }
            }
        }
        draw() {
            super.draw();
            let ctx = this.board.ctx;
            let textHeight = Math.floor(this.board.stoneRadius);
            ctx.font = `${textHeight}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            this.drawLabels(this.blackLabels, '#fff');
            this.drawLabels(this.whiteLabels, '#000');
        }
        drawLabels(labels, style) {
            let ctx = this.board.ctx;
            ctx.fillStyle = style;
            for (let label of labels) {
                let c = this.boardToCanvas(label.p.row, label.p.col);
                ctx.fillText(label.s, c.x, c.y);
            }
        }
    }
    exports.Variation = Variation;
    class Annotations extends DataLayer {
        constructor(dataPropName = 'annotations', filter = null) {
            super();
            this.dataPropName = dataPropName;
            this.filter = filter;
            this.annotations = new Map();
        }
        clear() {
            if (this.annotations.size > 0) {
                this.annotations.clear();
                this.board.draw();
            }
        }
        update(dataObj) {
            let annotations = this.getData(dataObj, this.dataPropName);
            if (annotations === undefined) {
                return false;
            }
            this.annotations.clear();
            if (annotations == null) {
                return true;
            }
            for (let annotation of annotations) {
                if (this.filter != null && this.filter.indexOf(annotation.shape) == -1) {
                    continue;
                }
                let byShape = this.annotations.get(annotation.shape);
                if (byShape === undefined) {
                    byShape = [];
                    this.annotations.set(annotation.shape, byShape);
                }
                byShape.push(annotation);
            }
            return true;
        }
        draw() {
            if (this.annotations.size == 0) {
                return;
            }
            let sr = this.board.stoneRadius;
            let ctx = this.board.ctx;
            ctx.lineCap = 'round';
            this.annotations.forEach((annotations, shape) => {
                switch (shape) {
                    case position_1.Annotation.Shape.Dot:
                        for (let annotation of annotations) {
                            let c = this.boardToCanvas(annotation.p.row, annotation.p.col);
                            ctx.fillStyle = annotation.color;
                            ctx.beginPath();
                            ctx.arc(c.x + 0.5, c.y + 0.5, 0.16 * sr, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                        break;
                    case position_1.Annotation.Shape.Triangle:
                        ctx.lineWidth = 3 * util_1.pixelRatio();
                        for (let annotation of annotations) {
                            let c = this.boardToCanvas(annotation.p.row, annotation.p.col);
                            ctx.strokeStyle = annotation.color;
                            ctx.beginPath();
                            ctx.moveTo(c.x, c.y - 0.7 * sr);
                            ctx.lineTo(c.x - 0.6 * sr, c.y + 0.42 * sr);
                            ctx.lineTo(c.x + 0.6 * sr, c.y + 0.42 * sr);
                            ctx.lineTo(c.x, c.y - 0.7 * sr);
                            ctx.stroke();
                        }
                        break;
                    case position_1.Annotation.Shape.DashedCircle:
                        ctx.lineWidth = 1 * util_1.pixelRatio();
                        ctx.setLineDash([4, 5]);
                        for (let annotation of annotations) {
                            let c = this.boardToCanvas(annotation.p.row, annotation.p.col);
                            ctx.strokeStyle = annotation.color;
                            ctx.beginPath();
                            ctx.arc(c.x + 0.5, c.y + 0.5, sr, 0, 2 * Math.PI);
                            ctx.stroke();
                        }
                        ctx.setLineDash([]);
                        break;
                }
            });
        }
    }
    exports.Annotations = Annotations;
    class NextMove {
        constructor(idx, n, q, alpha) {
            this.n = n;
            this.q = q;
            this.alpha = alpha;
            this.p = {
                row: Math.floor(idx / base_1.N),
                col: idx % base_1.N,
            };
        }
    }
    class Q extends DataLayer {
        constructor() {
            super(...arguments);
            this.nextMoves = [];
        }
        hasPoint(p) {
            for (let move of this.nextMoves) {
                if (base_1.movesEqual(p, move.p)) {
                    return true;
                }
            }
            return false;
        }
        clear() {
            if (this.nextMoves.length > 0) {
                this.nextMoves = [];
                this.board.draw();
            }
        }
        update(dataObj) {
            let childN = this.getData(dataObj, 'n');
            let childQ = this.getData(dataObj, 'childQ');
            if (childN == null || childQ == null) {
                return false;
            }
            this.nextMoves = [];
            let indices = [];
            for (let i = 0; i < base_1.N * base_1.N; ++i) {
                indices.push(i);
            }
            indices.sort((a, b) => {
                let n = childN;
                let q = childQ;
                if (n[b] != n[a]) {
                    return n[b] - n[a];
                }
                return q[b] - q[a];
            });
            let maxN = childN[indices[0]];
            if (maxN == 0) {
                return true;
            }
            let sumN = 0;
            for (let n of childN) {
                sumN += n;
            }
            let logMaxN = Math.log(maxN);
            let idx = indices[0];
            for (let i = 0; i < indices.length; ++i) {
                let idx = indices[i];
                let n = childN[idx];
                if (n == 0) {
                    break;
                }
                let q = childQ[idx] / 10;
                let alpha = Math.log(n) / logMaxN;
                alpha *= alpha;
                if (n < sumN / 100) {
                    break;
                }
                this.nextMoves.push(new NextMove(idx, n, q, alpha));
            }
            return true;
        }
        draw() {
            if (this.nextMoves.length == 0) {
                return;
            }
            let ctx = this.board.ctx;
            let pr = util_1.pixelRatio();
            let stoneRgb = this.board.toPlay == base_1.Color.Black ? 0 : 255;
            let textRgb = 255 - stoneRgb;
            for (let nextMove of this.nextMoves) {
                ctx.fillStyle =
                    `rgba(${stoneRgb}, ${stoneRgb}, ${stoneRgb}, ${nextMove.alpha})`;
                let c = this.boardToCanvas(nextMove.p.row, nextMove.p.col);
                ctx.beginPath();
                ctx.arc(c.x + 0.5, c.y + 0.5, this.board.stoneRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
            let textHeight = Math.floor(0.8 * this.board.stoneRadius);
            ctx.font = `${textHeight}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(${textRgb}, ${textRgb}, ${textRgb}, 0.8)`;
            let scoreScale = this.board.toPlay == base_1.Color.Black ? 1 : -1;
            for (let nextMove of this.nextMoves) {
                let c = this.boardToCanvas(nextMove.p.row, nextMove.p.col);
                let winRate = (scoreScale * nextMove.q + 100) / 2;
                ctx.fillText(winRate.toFixed(1), c.x, c.y);
            }
        }
    }
    exports.Q = Q;
});
//# sourceMappingURL=layer.js.map