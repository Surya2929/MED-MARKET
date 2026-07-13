import Report from '../models/Report.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';

const canAccessReport = async (report, user) => {
  if (user.role === 'admin') return true;
  if (report.reportedBy.toString() === user._id.toString()) return true;
  if (report.reportedUser && report.reportedUser.toString() === user._id.toString()) return true;
  if (report.reportedStore) {
    const store = await Store.findById(report.reportedStore);
    if (store && store.vendorId.toString() === user._id.toString()) return true;
  }
  return false;
};

export const createReport = async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;
    if (!orderId || !reason || !description) return res.status(400).json({ message: 'orderId, reason and description are required.' });

    const order = await Order.findById(orderId).populate('storeId');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    let reportedUser = null;
    let reportedStore = null;

    if (req.user.role === 'customer') {
      if (order.customerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your order.' });
      reportedStore = order.storeId._id;
      reportedUser = order.storeId.vendorId;
    } else if (req.user.role === 'vendor') {
      const store = await Store.findOne({ vendorId: req.user._id });
      if (!store || order.storeId._id.toString() !== store._id.toString()) return res.status(403).json({ message: 'Not your order.' });
      reportedUser = order.customerId;
    } else {
      return res.status(403).json({ message: 'Only customers and vendors can file complaints.' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      reportedUser,
      reportedStore,
      orderId,
      reason,
      description,
      status: 'Pending',
      messages: [{ sender: req.user._id, senderName: req.user.name, senderRole: req.user.role, text: description }]
    });

    res.status(201).json(report);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMyReports = async (req, res) => {
  try {
    let orConditions = [{ reportedBy: req.user._id }, { reportedUser: req.user._id }];
    if (req.user.role === 'vendor') {
      const store = await Store.findOne({ vendorId: req.user._id });
      if (store) orConditions.push({ reportedStore: store._id });
    }
    const reports = await Report.find({ $or: orConditions })
      .populate('reportedBy', 'name role')
      .populate('reportedUser', 'name role')
      .populate('reportedStore', 'storeName')
      .populate('orderId', '_id totalAmount status')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getReportByOrder = async (req, res) => {
  try {
    const report = await Report.findOne({ orderId: req.params.orderId, reportedBy: req.user._id })
      .populate('reportedBy', 'name role')
      .populate('reportedUser', 'name role');
    res.status(200).json(report || null);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getReportThread = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name role')
      .populate('reportedUser', 'name role')
      .populate('reportedStore', 'storeName')
      .populate('orderId', '_id totalAmount status');
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (!(await canAccessReport(report, req.user))) return res.status(403).json({ message: 'Not authorized to view this complaint.' });
    res.status(200).json(report);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const addMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (!(await canAccessReport(report, req.user))) return res.status(403).json({ message: 'Not authorized to reply here.' });

    report.messages.push({ sender: req.user._id, senderName: req.user.name, senderRole: req.user.role, text: text.trim() });
    await report.save();
    res.status(200).json(report);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name role email phone')
      .populate('reportedUser', 'name role email phone isBlocked')
      .populate('reportedStore', 'storeName address')
      .populate('orderId', '_id totalAmount status')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = status;
    await report.save();
    res.status(200).json({ message: `Report marked as ${status}`, report });
  } catch (error) { res.status(500).json({ message: error.message }); }
};