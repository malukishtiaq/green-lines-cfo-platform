/* INSERT THESE STAGES AFTER THE MILESTONES SECTION (after line 1299) and BEFORE the Modal (before line 1306) */

      {/* Stage 5: Workflow & Governance */}
      {stages[safeCurrent]?.key === 'governance' && (
        <Form form={governanceForm} layout="vertical" initialValues={{ approvalMode: 'MODE_A', notificationChannels: ['EMAIL'], reportCadence: 'MONTHLY', slaResponseHours: 24, escalationEnabled: true }}>
          <Title level={4}>Workflow & Governance</Title>
          <Paragraph type="secondary">
            Define how changes are approved, stakeholders are notified, and issues are escalated.
          </Paragraph>

          <Card size="small" style={{ marginBottom: 24 }}>
            <Form.Item name="approvalMode" label="Approval Policy" rules={[{ required: true }]}>
              <Select style={{ width: '100%' }}>
                <Option value="MODE_A">
                  <div><strong>Mode A:</strong> Client Approval Required</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Changes need client sign-off</div>
                </Option>
                <Option value="MODE_B">
                  <div><strong>Mode B:</strong> Notify Only</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Inform client, proceed automatically</div>
                </Option>
                <Option value="MODE_C">
                  <div><strong>Mode C:</strong> HQ Only</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Internal approval, no client involvement</div>
                </Option>
              </Select>
            </Form.Item>
          </Card>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="notificationChannels" label="Notification Channels" rules={[{ required: true, message: 'Select at least one channel' }]}>
                <Select mode="multiple" style={{ width: '100%' }}>
                  <Option value="IN_APP">In-App</Option>
                  <Option value="EMAIL">Email</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="reportCadence" label="Report Cadence & Recipients (CFO App)" rules={[{ required: true }]}>
                <Select style={{ width: '100%' }}>
                  <Option value="WEEKLY">Weekly</Option>
                  <Option value="MONTHLY">Monthly</Option>
                  <Option value="QUARTERLY">Quarterly</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="slaResponseHours" label="SLA Settings (Exception Response)" rules={[{ required: true }]}>
                <InputNumber min={1} max={168} style={{ width: '100%' }} placeholder="Response hours" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="escalationEnabled" label="Auto-Escalation" valuePropName="checked">
                <Checkbox>Enable automatic escalation for overdue issues</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}

      {/* Stage 6: Pricing & Commercials */}
      {stages[safeCurrent]?.key === 'pricing' && (
        <Form form={pricingForm} layout="vertical" initialValues={{ 
          platformCommissionPct: 40, 
          partnerCommissionPct: 60, 
          payoutDelayDays: 30, 
          refundPolicy: 'DEDUCTIONS',
          paymentTerms: 'NET_30' 
        }}>
          <Title level={4}>Pricing & Commercials</Title>
          <Paragraph type="secondary">
            Configure package pricing, add-ons, commission structure, and payment terms.
          </Paragraph>

          {/* Package Selection */}
          <Form.Item label="Package (Tiered Selection)" required>
            <Row gutter={[16, 16]}>
              {packageOptions.map(pkg => (
                <Col span={6} key={pkg.value}>
                  <Card 
                    size="small" 
                    hoverable
                    onClick={() => {
                      setSelectedPackage(pkg.value);
                      pricingForm.setFieldsValue({ 
                        package: pkg.value,
                        basePrice: pkg.price,
                        totalPrice: pkg.price
                      });
                    }}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedPackage === pkg.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      backgroundColor: selectedPackage === pkg.value ? '#e6f7ff' : 'white'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Text strong>{pkg.label}</Text>
                      <br />
                      <Text style={{ fontSize: 24, color: '#1890ff' }}>
                        {pkg.price > 0 ? `${pkg.price.toLocaleString()} AED` : 'Custom'}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Form.Item>

          {/* Add-ons */}
          <Form.Item label="Add-Ons (Credits, Managed CFO Meetings, etc.)">
            <Select 
              mode="multiple" 
              style={{ width: '100%' }} 
              placeholder="Select add-ons"
              value={selectedAddOns}
              onChange={(values) => {
                setSelectedAddOns(values);
                const basePackage = packageOptions.find(p => p.value === selectedPackage);
                const basePrice = basePackage?.price || 0;
                const addOnsPrice = values.reduce((sum, val) => {
                  const addOn = addOnOptions.find(a => a.value === val);
                  return sum + (addOn?.price || 0);
                }, 0);
                pricingForm.setFieldsValue({ totalPrice: basePrice + addOnsPrice });
              }}
            >
              {addOnOptions.map(addOn => (
                <Option key={addOn.value} value={addOn.value}>
                  {addOn.label} (+{addOn.price.toLocaleString()} AED)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Price Display */}
          <Card size="small" style={{ backgroundColor: '#f6ffed', marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text type="secondary">Base Package:</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {(packageOptions.find(p => p.value === selectedPackage)?.price || 0).toLocaleString()} AED
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Add-ons:</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {selectedAddOns.reduce((sum, val) => {
                    const addOn = addOnOptions.find(a => a.value === val);
                    return sum + (addOn?.price || 0);
                  }, 0).toLocaleString()} AED
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Total Price:</Text>
                <br />
                <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
                  {totalPrice.toLocaleString()} AED
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Commission Model */}
          <Title level={5}>Commission Model</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="platformCommissionPct" label="Default Platform Commission %" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="partnerCommissionPct" label="Partner Share %" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="payoutDelayDays" label="Payout Delay (days post-collection)" rules={[{ required: true }]}>
                <InputNumber min={0} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="refundPolicy" label="Refund Handling" rules={[{ required: true }]}>
                <Select style={{ width: '100%' }}>
                  <Option value="DEDUCTIONS">Deductions from partner & platform shares</Option>
                  <Option value="PLATFORM_ONLY">Platform absorbs refunds</Option>
                  <Option value="PARTNER_ONLY">Partner absorbs refunds</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Contract Dates */}
          <Title level={5} style={{ marginTop: 16 }}>Contract & Payment</Title>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="contractStartDate" label="Contract Start" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="contractEndDate" label="Contract End" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="paymentTerms" label="Payment Terms" rules={[{ required: true }]}>
                <Select style={{ width: '100%' }}>
                  <Option value="NET_15">Net 15 Days</Option>
                  <Option value="NET_30">Net 30 Days</Option>
                  <Option value="NET_60">Net 60 Days</Option>
                  <Option value="NET_90">Net 90 Days</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ marginTop: 16 }}>
            <Button type="default">Calculate</Button>
            <Button type="default">Download Proposal</Button>
          </Space>
        </Form>
      )}

      {/* Stage 7: Assignments & Partner Selection */}
      {stages[safeCurrent]?.key === 'assignments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Assignments & Partner Selection</Title>
              <Text type="secondary">Create assignments for partners to execute plan tasks (auto-generated from KPIs/milestones)</Text>
            </div>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openAssignmentModal()}>Create Assignment</Button>
              <Button type="default">Notify Partner</Button>
            </Space>
          </div>

          {assignments.length > 0 && (
            <Table
              dataSource={assignments}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Assignment Item', dataIndex: 'type', key: 'type', width: 150 },
                { title: 'Partner', dataIndex: 'partnerName', key: 'partnerName', width: 150, render: (text) => text || <Text type="secondary">Unassigned</Text> },
                { title: 'Owner', dataIndex: 'assignmentOwner', key: 'assignmentOwner', width: 120 },
                { title: 'SLA (hours)', dataIndex: 'slaHours', key: 'slaHours', width: 100 },
                { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 120 },
                { title: 'Priority', dataIndex: 'priority', key: 'priority', width: 100, render: (priority: string) => (
                  <Tag color={priority === 'URGENT' ? 'red' : priority === 'HIGH' ? 'orange' : priority === 'MEDIUM' ? 'blue' : 'default'}>
                    {priority}
                  </Tag>
                )},
                { title: 'Notes', dataIndex: 'notes', key: 'notes', width: 150, ellipsis: true },
                { title: 'Actions', key: 'actions', width: 120, fixed: 'right' as const, render: (_: any, record: AssignmentItem) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openAssignmentModal(record)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteAssignment(record.id)} />
                  </Space>
                )},
              ]}
            />
          )}

          {assignments.length === 0 && (
            <Card size="small" style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph type="secondary">
                No assignments created yet. Assignments can be auto-generated from KPIs and milestones, or created manually.
              </Paragraph>
            </Card>
          )}

          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f5ff' }}>
            <Paragraph style={{ marginBottom: 0 }}>
              <strong>💡 Partner Selection:</strong> System will match partners by type (ERP/Accounting/Stock Count), location, and availability
            </Paragraph>
          </Card>
        </div>
      )}

      {/* Stage 8: Review & Approval */}
      {stages[safeCurrent]?.key === 'review' && (
        <div>
          <Title level={4}>Review & Approval</Title>
          <Paragraph type="secondary">
            Review all plan details before final submission. Ensure all information is accurate.
          </Paragraph>

          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="📋 Client & Scope" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Client:</strong> {basicForm.getFieldValue('clientId') || 'Not selected'}<br />
                  <strong>Plan Type:</strong> {basicForm.getFieldValue('planType')}<br />
                  <strong>Branches:</strong> {basicForm.getFieldValue('branchQty')}<br />
                  <strong>Session:</strong> {basicForm.getFieldValue(['session', 'frequency'])} - {basicForm.getFieldValue(['session', 'presentMode'])}<br />
                  <strong>App Users:</strong> {users.length}
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="🔌 ERP & Data Sources" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>ERP Type:</strong> {erpForm.getFieldValue('erpType')}<br />
                  <strong>Connection Status:</strong> {erpForm.getFieldValue('erpStatus') || 'Not Connected'}<br />
                  <strong>Data Domains:</strong> {erpForm.getFieldValue('dataDomains')?.length || 0} selected<br />
                  <strong>Mapping Health:</strong> {erpForm.getFieldValue('mappingHealth') || 0}%
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="📊 KPIs & Targets" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Total KPIs:</strong> {kpis.length}<br />
                  <strong>Total Weight:</strong> {totalKPIWeight.toFixed(1)}%<br />
                  <strong>Status:</strong> <Tag color={totalKPIWeight === 100 ? 'success' : 'warning'}>
                    {totalKPIWeight === 100 ? '✓ Complete' : '⚠ Incomplete'}
                  </Tag>
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="🎯 Milestones & Timeline" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Total Milestones:</strong> {milestones.length}<br />
                  <strong>Budget Allocation:</strong> {totalBudget.toFixed(1)}%<br />
                  <strong>Status:</strong> <Tag color={totalBudget === 100 ? 'success' : 'warning'}>
                    {totalBudget === 100 ? '✓ Complete' : '⚠ Incomplete'}
                  </Tag>
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="⚙️ Workflow & Governance" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Approval Mode:</strong> {governanceForm.getFieldValue('approvalMode')}<br />
                  <strong>Notification:</strong> {governanceForm.getFieldValue('notificationChannels')?.join(', ')}<br />
                  <strong>Report Cadence:</strong> {governanceForm.getFieldValue('reportCadence')}<br />
                  <strong>SLA Response:</strong> {governanceForm.getFieldValue('slaResponseHours')}h
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="💰 Pricing & Commercials" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Package:</strong> {selectedPackage || 'Not selected'}<br />
                  <strong>Total Price:</strong> {totalPrice.toLocaleString()} AED<br />
                  <strong>Platform Commission:</strong> {pricingForm.getFieldValue('platformCommissionPct')}%<br />
                  <strong>Payment Terms:</strong> {pricingForm.getFieldValue('paymentTerms')}
                </Paragraph>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="👥 Assignments & Partners" size="small">
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>Total Assignments:</strong> {assignments.length}<br />
                  <strong>Assigned:</strong> {assignments.filter(a => a.partnerId).length}<br />
                  <strong>Unassigned:</strong> {assignments.filter(a => !a.partnerId).length}
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* Risk Checklist */}
          <Card title="⚠️ Risk Checklist" size="small" style={{ marginTop: 16 }}>
            <Paragraph type="secondary">Verify these items before submitting the plan</Paragraph>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}><Checkbox value="data-readiness">Data readiness confirmed (ERP connection tested)</Checkbox></Col>
                <Col span={24}><Checkbox value="partner-availability">Partner availability confirmed for all assignments</Checkbox></Col>
                <Col span={24}><Checkbox value="client-approval">Client has reviewed and approved plan objectives</Checkbox></Col>
                <Col span={24}><Checkbox value="kpi-realistic">KPI targets are realistic and achievable</Checkbox></Col>
                <Col span={24}><Checkbox value="milestone-feasible">Milestone timelines are feasible</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Card>

          {/* Legal/Terms Checkbox */}
          <Card title="✅ Legal & Terms" size="small" style={{ marginTop: 16 }}>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}><Checkbox value="plan-accuracy">I confirm all plan information is accurate and complete</Checkbox></Col>
                <Col span={24}><Checkbox value="kpis-complete">All KPIs are configured with correct weights (total = 100%)</Checkbox></Col>
                <Col span={24}><Checkbox value="milestones-complete">All milestones are defined with correct budget allocation (total = 100%)</Checkbox></Col>
                <Col span={24}><Checkbox value="pricing-correct">Pricing, commission model, and payment terms are correct</Checkbox></Col>
                <Col span={24}><Checkbox value="legal-terms"><strong>I accept the legal terms and conditions</strong></Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Card>

          <Card size="small" style={{ marginTop: 16, backgroundColor: '#fff7e6', borderColor: '#ffa940' }}>
            <Paragraph style={{ marginBottom: 0 }}>
              <strong>⚠️ Important Notice:</strong> Once you click "Approve & Activate Plan", this plan will become active and visible to all stakeholders (client, partners). 
              You can still make changes later through the Plan Monitor, but they may require client approval based on your governance policy (Mode A/B/C).
            </Paragraph>
          </Card>
        </div>
      )}

