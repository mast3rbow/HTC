Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.MessageBox = function (cfg) { // copy from ExtJS 3.1.1 source
    cfg = cfg || {}; // added

    var dlg, opt, mask, waitTimer,
        bodyEl, msgEl, textboxEl, textareaEl, progressBar, pp, iconEl, spacerEl,
        buttons, activeTextEl, bwidth, bufferIcon = '', iconCls = '',
        buttonNames = ['ok', 'yes', 'no', 'cancel'];
    
    var handleButton = function (button) {
        buttons[button].blur();
        if (dlg.isVisible()) {
            dlg.hide();
            handleHide();
            Ext.callback(opt.fn, opt.scope || window, [button, activeTextEl.dom.value, opt], 1);
        }
    };

    var handleHide = function () {
        if (opt && opt.cls) {
            dlg.el.removeClass(opt.cls);
        }
        progressBar.reset();
    };

    var handleEsc = function (d, k, e) {
        if (opt && opt.closable !== false) {
            dlg.hide();
            handleHide();
        }
        if (e) {
            e.stopEvent();
        }
    };

    var updateButtons = function (b) {
        var width = 0,
            cfg;
        if (!b) {
            Ext.each(buttonNames, function (name) {
                buttons[name].hide();
            });
            return width;
        }
        dlg.footer.dom.style.display = '';
        Ext.iterate(buttons, function (name, btn) {
            cfg = b[name];
            if (cfg) {
                btn.show();
                btn.setText(Ext.isString(cfg) ? cfg : Ext.MessageBox.buttonText[name]);
                width += btn.getEl().getWidth() + 15;
            } else {
                btn.hide();
            }
        });
        return width;
    };

    return {
        getDialog: function (titleText) {
            if (!dlg) {
                var btns = [];

                buttons = {};
                Ext.each(buttonNames, function (name) {
                    btns.push(buttons[name] = new Ext.Button({
                        text: this.buttonText[name],
                        handler: handleButton.createCallback(name),
                        hideMode: 'offsets'
                    }));
                }, this);

                var elDom = (Ext.get(cfg.container) || Ext.getBody()).dom; // added
                var _Window = elDom.tagName.toLowerCase() != 'body' ? Ext.Window.extend({
                    renderTo: elDom,
                    beforeShow: function () {
                        delete this.el.lastXY;
                        delete this.el.lastLT;
                        if (this.x === undefined || this.y === undefined) {
                            var xy = this.el.getAlignToXY(this.container, 'c-c');
                            var pos = this.el.translatePoints(xy[0], xy[1]);
                            this.x = this.x === undefined ? pos.left : this.x;
                            this.y = this.y === undefined ? pos.top : this.y;
                        }
                        this.el.setLeftTop(this.x, this.y);
                        if (this.expandOnShow) {
                            this.expand(false);
                        }
                        if (this.modal) {
                            if (this.container) {
                                this.container.addClass('x-body-masked');
                                //this.mask.setSize(this.container.getViewSize().width, this.container.getViewSize().height);
                            } else {
                                Ext.getBody().addClass('x-body-masked');
                                this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                            }
                            /* commented
                            Ext.getBody().addClass('x-body-masked');
                            this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                            */
                            this.mask.show();
                        }
                    }
                }) : Ext.Window;

                dlg = new _Window({ // changed from Ext.Window
                    renderTo: elDom, // added
                    autoCreate: true,
                    title: titleText,
                    resizable: false,
                    constrain: true,
                    constrainHeader: true,
                    minimizable: false,
                    maximizable: false,
                    stateful: false,
                    modal: true,
                    shim: true,
                    buttonAlign: "center",
                    width: 400,
                    height: 100,
                    minHeight: 80,
                    plain: true,
                    footer: true,
                    closable: true,
                    close: function () {
                        if (opt && opt.buttons && opt.buttons.no && !opt.buttons.cancel) {
                            handleButton("no");
                        } else {
                            handleButton("cancel");
                        }
                    },
                    fbar: new Ext.Toolbar({
                        items: btns,
                        enableOverflow: false
                    })
                });
                dlg.render(elDom); // changed (document.body);
                dlg.getEl().addClass('x-window-dlg');
                mask = dlg.mask;
                bodyEl = dlg.body.createChild({
                    html: '<div class="ext-mb-icon"></div><div class="ext-mb-content"><span class="ext-mb-text"></span><br /><div class="ext-mb-fix-cursor"><input type="text" class="ext-mb-input" /><textarea class="ext-mb-textarea"></textarea></div></div>'
                });
                iconEl = Ext.get(bodyEl.dom.firstChild);
                var contentEl = bodyEl.dom.childNodes[1];
                msgEl = Ext.get(contentEl.firstChild);
                textboxEl = Ext.get(contentEl.childNodes[2].firstChild);
                textboxEl.enableDisplayMode();
                textboxEl.addKeyListener([10, 13], function () {
                    if (dlg.isVisible() && opt && opt.buttons) {
                        if (opt.buttons.ok) {
                            handleButton("ok");
                        } else if (opt.buttons.yes) {
                            handleButton("yes");
                        }
                    }
                });
                textareaEl = Ext.get(contentEl.childNodes[2].childNodes[1]);
                textareaEl.enableDisplayMode();
                progressBar = new Ext.ProgressBar({
                    renderTo: bodyEl
                });
                bodyEl.createChild({ cls: 'x-clear' });
            }
            return dlg;
        },

        updateText: function (text) {
            if (!dlg.isVisible() && !opt.width) {
                dlg.setSize(this.maxWidth, 100); // resize first so content is never clipped from previous shows
            }
            // Append a space here for sizing. In IE, for some reason, it wraps text incorrectly without one in some cases
            msgEl.update(text ? text + ' ' : '&#160;');

            var iw = iconCls != '' ? (iconEl.getWidth() + iconEl.getMargins('lr')) : 0,
                mw = msgEl.getWidth() + msgEl.getMargins('lr'),
                fw = dlg.getFrameWidth('lr'),
                bw = dlg.body.getFrameWidth('lr'),
                w;

            w = Math.max(Math.min(opt.width || iw + mw + fw + bw, opt.maxWidth || this.maxWidth),
                    Math.max(opt.minWidth || this.minWidth, bwidth || 0));

            if (opt.prompt === true) {
                activeTextEl.setWidth(w - iw - fw - bw);
            }
            if (opt.progress === true || opt.wait === true) {
                progressBar.setSize(w - iw - fw - bw);
            }
            if (Ext.isIE && w == bwidth) {
                w += 4; //Add offset when the content width is smaller than the buttons.    
            }
            msgEl.update(text || '&#160;');
            dlg.setSize(w, 'auto').center();
            return this;
        },

        updateProgress: function (value, progressText, msg) {
            progressBar.updateProgress(value, progressText);
            if (msg) {
                this.updateText(msg);
            }
            return this;
        },

        isVisible: function () {
            return dlg && dlg.isVisible();
        },

        hide: function() {
            var proxy = dlg ? dlg.activeGhost : null;
            if (this.isVisible() || proxy) {
                dlg.hide();
                handleHide();
                if (proxy) {
                    // unghost is a private function, but i saw no better solution
                    // to fix the locking problem when dragging while it closes
                    dlg.unghost(false, false);
                }
            }
            return this;
        },

        show: function (options) {
            if (this.isVisible()) {
                this.hide();
            }
            opt = options;
            var d = this.getDialog(opt.title || "&#160;");

            d.setTitle(opt.title || "&#160;");
            var allowClose = (opt.closable !== false && opt.progress !== true && opt.wait !== true);
            d.tools.close.setDisplayed(allowClose);
            activeTextEl = textboxEl;
            opt.prompt = opt.prompt || (opt.multiline ? true : false);
            if (opt.prompt) {
                if (opt.multiline) {
                    textboxEl.hide();
                    textareaEl.show();
                    // fixed hidden input
                    if (textareaEl.dom) {
                        textareaEl.dom.style.display = '';
                    }
                    textareaEl.setHeight(Ext.isNumber(opt.multiline) ? opt.multiline : this.defaultTextHeight);
                    activeTextEl = textareaEl;
                } else {
                    textboxEl.show();
                    // fixed hidden input
                    if (textboxEl.dom) {
                        textboxEl.dom.style.display = '';
                    }
                    textareaEl.hide();
                }
            } else {
                textboxEl.hide();
                textareaEl.hide();
            }
            activeTextEl.dom.value = opt.value || "";
            if (opt.prompt) {
                d.focusEl = activeTextEl;
            } else {
                var bs = opt.buttons;
                var db = null;
                if (bs && bs.ok) {
                    db = buttons["ok"];
                } else if (bs && bs.yes) {
                    db = buttons["yes"];
                }
                if (db) {
                    d.focusEl = db;
                }
            }
            if (Ext.isDefined(opt.iconCls)) {
                d.setIconClass(opt.iconCls);
            }
            this.setIcon(Ext.isDefined(opt.icon) ? opt.icon : bufferIcon);
            bwidth = updateButtons(opt.buttons);
            progressBar.setVisible(opt.progress === true || opt.wait === true);
            this.updateProgress(0, opt.progressText);
            this.updateText(opt.msg);
            if (opt.cls) {
                d.el.addClass(opt.cls);
            }
            d.proxyDrag = opt.proxyDrag === true;
            d.modal = opt.modal !== false;
            d.mask = opt.modal !== false ? mask : false;
            if (!d.isVisible()) {
                // force it to the end of the z-index stack so it gets a cursor in FF
                if (dlg.container) { // added
                    dlg.container.dom.appendChild(dlg.el.dom);
                } else {
                    document.body.appendChild(dlg.el.dom);
                }
                d.setAnimateTarget(opt.animEl);
                //workaround for window internally enabling keymap in afterShow
                d.on('show', function () {
                    if (allowClose === true) {
                        d.keyMap.enable();
                    } else {
                        d.keyMap.disable();
                    }
                }, this, { single: true });
                d.show(opt.animEl);
            }
            if (opt.wait === true) {
                progressBar.wait(opt.waitConfig);
            }
            return this;
        },

        setIcon: function (icon) {
            if (!dlg) {
                bufferIcon = icon;
                return;
            }
            bufferIcon = undefined;
            if (icon && icon != '') {
                iconEl.removeClass('x-hidden');
                iconEl.replaceClass(iconCls, icon);
                bodyEl.addClass('x-dlg-icon');
                iconCls = icon;
            } else {
                iconEl.replaceClass(iconCls, 'x-hidden');
                bodyEl.removeClass('x-dlg-icon');
                iconCls = '';
            }
            return this;
        },

        progress: function (title, msg, progressText) {
            this.show({
                title: title,
                msg: msg,
                buttons: false,
                progress: true,
                closable: false,
                minWidth: this.minProgressWidth,
                progressText: progressText
            });
            return this;
        },

        wait: function (msg, title, config) {
            this.show({
                title: title,
                msg: msg,
                buttons: false,
                closable: false,
                wait: true,
                modal: true,
                minWidth: this.minProgressWidth,
                waitConfig: config
            });
            return this;
        },

        alert: function (title, msg, fn, scope) {
            this.show({
                title: title,
                msg: msg,
                buttons: this.OK,
                fn: fn,
                scope: scope,
                minWidth: this.minWidth
            });
            return this;
        },

        confirm: function (title, msg, fn, scope) {
            this.show({
                title: title,
                msg: msg,
                buttons: this.YESNO,
                fn: fn,
                scope: scope,
                icon: this.QUESTION,
                minWidth: this.minWidth
            });
            return this;
        },

        prompt: function (title, msg, fn, scope, multiline, value) {
            this.show({
                title: title,
                msg: msg,
                buttons: this.OKCANCEL,
                fn: fn,
                minWidth: this.minPromptWidth,
                scope: scope,
                prompt: true,
                multiline: multiline,
                value: value
            });
            return this;
        },

        OK: { ok: true },
        CANCEL: { cancel: true },
        OKCANCEL: { ok: true, cancel: true },
        YESNO: { yes: true, no: true },
        YESNOCANCEL: { yes: true, no: true, cancel: true },
        INFO: 'ext-mb-info',
        WARNING: 'ext-mb-warning',
        QUESTION: 'ext-mb-question',
        ERROR: 'ext-mb-error',

        defaultTextHeight: 75,
        maxWidth: cfg.maxWidth || 600,
        minWidth: 100,
        minProgressWidth: 250,
        minPromptWidth: 250,

        buttonText: {
            ok: "OK",
            cancel: "Cancel",
            yes: "Yes",
            no: "No"
        }
    };
};