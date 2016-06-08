Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var iterationCombobox;
		var currentContext = this.getContext();
		//Get the current user and project
		var user = currentContext.getUser();
		var workspace = currentContext.getDataContext();
		console.log(workspace);
        iterationCombobox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            listeners: {
                select: function(combobox) {
                    return this.getAcceptance(combobox,workspace);
                },
                ready: function(combobox) {
                    return this.getAcceptance(combobox,workspace);
                },
                scope: this
            },
            storeConfig: {
                fetch: ['Name', '_ref', 'ObjectID', 'State']
            }
        });

        return this.add(iterationCombobox);
    },
    getAcceptance: function(combobox,workspace) {
        var iterationRef = combobox.getRecord().get('_ref');
        var storyStore, myGrid, customStoreRecords;
        this.customStoreRecords = [];
        storyStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'User Story',
            autoLoad: true,
            fetch: ['Name', 'ScheduleState', 'PlanEstimate', 'PlannedVelocity', '_ref'],
            filters: [{
                property: 'Iteration',
                operator: '=',
                value: iterationRef
            }],
            listeners: {
                load: function(store, storyRecords) {
                    if (storyRecords.length !== 0) {
                        var totalEstimate = 0,
							totalAccepted = 0,
							computeAcceptance;
                        Ext.Array.each(storyRecords, function(storyRecords) {
                            if (storyRecords.get('PlanEstimate') !== null) {
                                totalEstimate = totalEstimate + parseInt(storyRecords.get('PlanEstimate'), 10);
                            } else {
                                totalEstimate = totalEstimate;
                            }
							if (storyRecords.get('ScheduleState') == 'Accepted') {
                                totalAccepted = totalAccepted + parseInt(storyRecords.get('PlanEstimate'), 10);
                            }

                        });
						
						
                        var acceptance = Math.floor((totalAccepted / totalEstimate)*100);
                        var Team = workspace._refObjectName;
                        console.log('totalEstimate' + totalEstimate);
                        console.log('totalAccepted' + totalAccepted);
                        console.log('% Acceptance' + acceptance);
                        this.customStoreRecords.push({
                            'Acceptance': acceptance,
                            'team': Team
                        });
                        var myStore;
                        myStore = Ext.create('Rally.data.custom.Store', {
                            data: this.customStoreRecords
                        });
						
						this.myGrid = Ext.create('Ext.grid.Panel', {
							title: 'ACCEPTANCE',
							store: myStore,
							columns: [
								{text: 'Team', dataIndex: 'team', flex: 1},
								{text: 'Acceptance', dataIndex: 'Acceptance', flex: 1
										/* text: 'Acceptance',
										xtype: 'templatecolumn',
										tpl: Ext.create('Rally.ui.renderer.template.progressbar.ProgressBarTemplate', {
											percentDoneName: 'Acceptance',
											calculateColorFn: function(recordData) {
												console.log(recordData);
												if (recordData.Acceptance > 0.8) {
													colVal = "#B2E3B6"; // Green
												} else if (recordData.Acceptance > 0.5) {
													colVal = "#FBDE98"; // Orange
												} else {
													colVal = "#FCB5B1"; // Red
												}
												console.log('colVal : '+colVal);
												console.log('Acceptance : '+recordData.Acceptance);
											return colVal;
											}
										}) */
					}
							],
							height: 200,
							width: 400
						});
                        this.add(this.myGrid);
                    }
                },
                scope: this
            }
        });

        return storyStore;
    }

});