/* ADDITIONAL MODALS TO INSERT AFTER THE MILESTONE MODAL (after line 1398) */

      {/* KPI Modal */}
      <Modal
        open={kpiModalVisible}
        title={editingKPI ? `Edit KPI: ${editingKPI.kpiName}` : 'Add Custom KPI'}
        onCancel={() => setKPIModalVisible(false)}
        onOk={saveKPI}
        okText="Save"
        width={700}
      >
        <Form form={kpiForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="kpiCode" label="KPI Code" rules={[{ required: true }]}>
                <Input placeholder="e.g., FIN.REV_GROWTH" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="kpiName" label="KPI Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Revenue Growth %" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="calculationSource" label="Calculation Source / Data Source" rules={[{ required: true }]}>
            <Input placeholder="e.g., GL, Sales Ledger" />
          </Form.Item>

          <Form.Item name="targetValue" label="Target Value" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Enter target value" />
          </Form.Item>

          <Divider>Thresholds</Divider>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name="thresholdGreen" label="Green (≥)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="thresholdAmber" label="Amber (≥)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="thresholdRed" label="Red (<)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="weight" label="Weight % (for overall plan status)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="effectiveFrom" label="Effective From" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="effectiveTo" label="Effective To">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        open={assignmentModalVisible}
        title={editingAssignment ? `Edit Assignment` : 'Create Assignment'}
        onCancel={() => setAssignmentModalVisible(false)}
        onOk={saveAssignment}
        okText="Save"
        width={700}
      >
        <Form form={assignmentForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="type" label="Assignment Item (Type)" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value="SETUP">Setup</Option>
              <Option value="TRAINING">Training</Option>
              <Option value="IMPLEMENTATION">Implementation</Option>
              <Option value="SUPPORT">Support</Option>
              <Option value="ERP_INTEGRATION">ERP Integration</Option>
              <Option value="ACCOUNTING">Accounting Services</Option>
              <Option value="STOCK_COUNT">Stock Count</Option>
            </Select>
          </Form.Item>

          <Form.Item name="partnerId" label="Partner Selection (Match by Type)">
            <Select 
              showSearch
              style={{ width: '100%' }} 
              placeholder="Select partner or leave unassigned"
              allowClear
              options={[
                { value: 'partner1', label: 'ERP Consultant - Ahmed Hassan' },
                { value: 'partner2', label: 'Accounting Firm - ABC Auditors' },
                { value: 'partner3', label: 'Stock Count - XYZ Services' },
              ]}
            />
          </Form.Item>

          <Form.Item name="assignmentOwner" label="Assignment Owner (Team)" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value="PARTNER_TEAM">Partner Team</Option>
              <Option value="HQ_TEAM">HQ Team</Option>
              <Option value="CLIENT_TEAM">Client Team</Option>
            </Select>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="slaHours" label="SLA (hours)" rules={[{ required: true }]}>
                <InputNumber min={1} max={720} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="URGENT">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes & Attachments">
            <Input.TextArea rows={3} placeholder="Add notes or describe attachments" />
          </Form.Item>

          <Card size="small" style={{ backgroundColor: '#f0f5ff' }}>
            <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
              <strong>💡 Partner Matching:</strong> System automatically suggests partners based on type, location, availability, and past performance.
            </Paragraph>
          </Card>
        </Form>
      </Modal>

