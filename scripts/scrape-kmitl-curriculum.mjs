#!/usr/bin/env node
/**
 * Merge KMITL curriculum data (from office.kmitl.ac.th) with TCAS data
 * to create a comprehensive seed file.
 *
 * This script uses the already-fetched TCAS data and enriches it with
 * the full curriculum data scraped from KMITL's official curriculum page.
 *
 * Usage: node scripts/scrape-kmitl-curriculum.mjs
 */
import { writeFileSync, readFileSync } from "fs";

// Full curriculum data extracted from https://office.kmitl.ac.th/oaq/curriculum/
const KMITL_CURRICULUM = {
  university: {
    name: "King Mongkut's Institute of Technology Ladkrabang",
    name_th: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
    website: "https://www.kmitl.ac.th",
  },
  faculties: [
    {
      name: "School of Engineering",
      name_th: "คณะวิศวกรรมศาสตร์",
      programs: [
        // Thai programs
        { name: "B.Eng. Food Engineering", name_th: "วศ.บ. วิศวกรรมอาหาร", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Information Engineering", name_th: "วศ.บ. วิศวกรรมสารสนเทศ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. IoT and Information Systems Engineering", name_th: "วศ.บ. วิศวกรรมไอโอทีและสารสนเทศ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Agricultural Engineering", name_th: "วศ.บ. วิศวกรรมเกษตร", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Smart Agricultural Engineering", name_th: "วศ.บ. วิศวกรรมเกษตรอัจฉริยะ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Mechanical Engineering", name_th: "วศ.บ. วิศวกรรมเครื่องกล", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Chemical Engineering", name_th: "วศ.บ. วิศวกรรมเคมี", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Control Engineering", name_th: "วศ.บ. วิศวกรรมการวัดคุม", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Mechatronics and Automation", name_th: "วศ.บ. วิศวกรรมเมคคาทรอนิกส์และระบบวัดคุม", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Petrochemical Engineering", name_th: "วศ.บ. วิศวกรรมปิโตรเคมี", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Civil Engineering", name_th: "วศ.บ. วิศวกรรมโยธา", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Industrial Engineering", name_th: "วศ.บ. วิศวกรรมอุตสาหการ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Computer Engineering", name_th: "วศ.บ. วิศวกรรมคอมพิวเตอร์", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Electrical Engineering", name_th: "วศ.บ. วิศวกรรมไฟฟ้า", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Electronics Engineering", name_th: "วศ.บ. วิศวกรรมอิเล็กทรอนิกส์", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Telecommunications Engineering", name_th: "วศ.บ. วิศวกรรมโทรคมนาคมและโครงข่าย", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Integrated Manufacturing Engineering", name_th: "วศ.บ. วิศวกรรมการผลิตเชิงบูรณาการ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Aerospace and Geospatial Engineering", name_th: "วศ.บ. วิศวกรรมอวกาศและภูมิสารสนเทศ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Computer Engineering and Cybersecurity", name_th: "วศ.บ. วิศวกรรมคอมพิวเตอร์และความปลอดภัยไซเบอร์", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Railway Transport Engineering", name_th: "วศ.บ. วิศวกรรมขนส่งทางราง", degree_type: "bachelor", is_international: false },
        // International programs
        { name: "B.Eng. Robotics and AI (International)", name_th: "วศ.บ. วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Civil Engineering (International)", name_th: "วศ.บ. วิศวกรรมโยธา (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Electrical Engineering (International)", name_th: "วศ.บ. วิศวกรรมไฟฟ้า (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Energy Engineering (International)", name_th: "วศ.บ. วิศวกรรมพลังงาน (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Software Engineering (International)", name_th: "วศ.บ. วิศวกรรมซอฟต์แวร์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Biomedical Engineering (International)", name_th: "วศ.บ. วิศวกรรมชีวการแพทย์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Mechanical Engineering (International)", name_th: "วศ.บ. วิศวกรรมเครื่องกล (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Chemical Engineering (International)", name_th: "วศ.บ. วิศวกรรมเคมี (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Computer Engineering (International)", name_th: "วศ.บ. วิศวกรรมคอมพิวเตอร์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Financial Engineering (International)", name_th: "วศ.บ. วิศวกรรมการเงิน (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Engineering Management and Entrepreneurship (International)", name_th: "วศ.บ. การจัดการวิศวกรรมและการเป็นผู้ประกอบการ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. AI and Entrepreneurship Engineering (International)", name_th: "วศ.บ. วิศวกรรมปัญญาประดิษฐ์และการเป็นผู้ประกอบการ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Mechatronics Engineering (International)", name_th: "วศ.บ. วิศวกรรมแมคคาทรอนิกส์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Industrial and Digital Systems Management (International)", name_th: "วศ.บ. วิศวกรรมอุตสาหการและระบบการจัดการเชิงดิจิทัล (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Industrial Engineering and Logistics Management (International)", name_th: "วศ.บ. วิศวกรรมอุตสาหการและการจัดการโลจิสติกส์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "School of Architecture, Art and Design",
      name_th: "คณะสถาปัตยกรรม ศิลปะและการออกแบบ",
      programs: [
        { name: "B.L.A. Landscape Architecture (5 years)", name_th: "ภ.สถ.บ. ภูมิสถาปัตยกรรมศาสตร์", degree_type: "bachelor", is_international: false },
        { name: "B.Arch. Architecture (5 years)", name_th: "สถ.บ. สถาปัตยกรรมหลัก", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Industrial Design", name_th: "ศ.บ. ศิลปอุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Fine Arts, Media Arts and Illustration", name_th: "ศ.บ. ศิลปกรรม มีเดียอาตส์ และอิลลัสเตชันอาร์ต", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Film and Digital Media", name_th: "ศ.บ. ภาพยนตร์และดิจิทัลมีเดีย", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Printmaking and Illustration", name_th: "ศ.บ. ภาพพิมพ์และอิลลัสเตชั่น", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Sculpture and Public Sculpture", name_th: "ศ.บ. ประติมากรรมและประติมากรรมเพื่อสังคม", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Curatorial Studies", name_th: "ศ.บ. นิเทศศิลป์", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Painting and Media Arts", name_th: "ศ.บ. จิตรกรรมและมีเดียอาตส์", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. 3D Information Design", name_th: "ศ.บ. การออกแบบสนเทศสามมิติ", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Photography", name_th: "ศ.บ. การถ่ายภาพ", degree_type: "bachelor", is_international: false },
        { name: "B.F.A. Experience Design for Integrated Media", name_th: "ศ.บ. การออกแบบประสบการณ์สำหรับสื่อบูรณาการ", degree_type: "bachelor", is_international: false },
        { name: "B.Arch. Design Intelligence for Creative Economy (International)", name_th: "สถ.บ. ปัญญาออกแบบเพื่อเศรษฐกิจสร้างสรรค์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Arch. Architecture (International)", name_th: "สถ.บ. สถาปัตยกรรม (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.F.A. Creative Arts and Heritage Studies (International)", name_th: "ศ.บ. ศิลปะสร้างสรรค์และภัณฑารักษาศึกษา (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "Faculty of Industrial Education and Technology",
      name_th: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
      programs: [
        { name: "B.I.Ed. Architecture", name_th: "ค.อ.บ. สถาปัตยกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Interior Environment Design", name_th: "ค.อ.บ. การออกแบบสภาพแวดล้อมภายใน", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Design Education", name_th: "ค.อ.บ. ครุศาสตร์การออกแบบ", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Innovation and Design Technology", name_th: "ค.อ.บ. นวัตกรรมและเทคโนโลยีการออกแบบ", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Engineering Education", name_th: "ค.อ.บ. ครุศาสตร์วิศวกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Agricultural Education", name_th: "ค.อ.บ. ครุศาสตร์เกษตร", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Learning Management Science", name_th: "ค.อ.บ. วิทยาการจัดการเรียนรู้", degree_type: "bachelor", is_international: false },
        { name: "B.I.Ed. Computer Technology", name_th: "ค.อ.บ. เทคโนโลยีคอมพิวเตอร์", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "Faculty of Agricultural Technology",
      name_th: "คณะเทคโนโลยีการเกษตร",
      programs: [
        { name: "B.Sc. Fishery Science", name_th: "วท.บ. วิทยาศาสตร์การประมง", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Aquaculture and Fishery Resource Innovation", name_th: "วท.บ. นวัตกรรมการผลิตสัตว์น้ำและการจัดการทรัพยากรประมง", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Landscape Design and Environmental Management", name_th: "วท.บ. การออกแบบและการจัดการภูมิทัศน์เพื่อสิ่งแวดล้อม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Agricultural Development", name_th: "วท.บ. พัฒนาการเกษตร", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Smart Farm Management", name_th: "วท.บ. การจัดการสมาร์ตฟาร์ม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Animal Science", name_th: "วท.บ. สัตวศาสตร์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Livestock Production and Meat Science", name_th: "วท.บ. เทคโนโลยีการผลิตสัตว์และวิทยาศาสตร์เนื้อสัตว์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Agronomy", name_th: "วท.บ. เกษตรศาสตร์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Crop Production Technology", name_th: "วท.บ. เทคโนโลยีการผลิตพืช", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Horticultural Innovation", name_th: "วท.บ. นวัตกรรมพืชสวน", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Companion Animal Care and Pet Business", name_th: "วท.บ. การพยาบาลสัตว์และการจัดการธุรกิจสัตว์เลี้ยง", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "School of Science",
      name_th: "คณะวิทยาศาสตร์",
      programs: [
        { name: "B.Sc. Industrial Physics", name_th: "วท.บ. ฟิสิกส์อุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Applied Mathematics", name_th: "วท.บ. คณิตศาสตร์ประยุกต์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Computer Science", name_th: "วท.บ. วิทยาการคอมพิวเตอร์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Applied Statistics and Data Analysis", name_th: "วท.บ. สถิติประยุกต์และการวิเคราะห์ข้อมูล", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Industrial Chemistry", name_th: "วท.บ. เคมีอุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Environmental Technology and Sustainable Management", name_th: "วท.บ. เทคโนโลยีสิ่งแวดล้อมและการจัดการอย่างยั่งยืน", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Industrial Biotechnology", name_th: "วท.บ. เทคโนโลยีชีวภาพอุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Industrial Microbiology", name_th: "วท.บ. จุลชีววิทยาอุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Digital Technology and Integrated Innovation (International)", name_th: "วท.บ. เทคโนโลยีดิจิทัลและนวัตกรรมเชิงบูรณาการ (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "Faculty of Information Technology",
      name_th: "คณะเทคโนโลยีสารสนเทศ",
      programs: [
        { name: "B.Sc. Information Technology", name_th: "วท.บ. เทคโนโลยีสารสนเทศ", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Data Science and Business Analytics", name_th: "วท.บ. วิทยาการข้อมูลและการวิเคราะห์เชิงธุรกิจ", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Artificial Intelligence Technology", name_th: "วท.บ. เทคโนโลยีปัญญาประดิษฐ์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Business Information Technology (International)", name_th: "วท.บ. เทคโนโลยีสารสนเทศทางธุรกิจ (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "Faculty of Food Industry",
      name_th: "คณะอุตสาหกรรมอาหาร",
      programs: [
        { name: "B.Sc. Food Science and Technology", name_th: "วท.บ. วิทยาศาสตร์และเทคโนโลยีการอาหาร", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Fermentation Technology in Food Industry", name_th: "วท.บ. เทคโนโลยีการหมักในอุตสาหกรรมอาหาร", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Food Processing Engineering", name_th: "วศ.บ. วิศวกรรมแปรรูปอาหาร", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Culinary Science and Food Service Management (International)", name_th: "วท.บ. วิทยาศาสตร์การประกอบอาหารและการจัดการการบริการอาหาร (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "KMITL Business School",
      name_th: "คณะบริหารธุรกิจ",
      programs: [
        { name: "B.B.A. Business Administration", name_th: "บธ.บ. บริหารธุรกิจ", degree_type: "bachelor", is_international: false },
        { name: "B.Econ. Business Economics and Management", name_th: "ศ.บ. เศรษฐศาสตร์ธุรกิจและการจัดการ", degree_type: "bachelor", is_international: false },
        { name: "B.B.A. Digital Transformation and Technology Management", name_th: "บธ.บ. การเปลี่ยนแปลงทางดิจิทัลและการจัดการเทคโนโลยี", degree_type: "bachelor", is_international: false },
        { name: "B.B.A. Business Administration (International)", name_th: "บธ.บ. บริหารธุรกิจ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.B.A. Global Entrepreneurship (International)", name_th: "บธ.บ. การเป็นผู้ประกอบการระดับโลก (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "International Academy of Aviation Industry",
      name_th: "วิทยาลัยอุตสาหกรรมการบินนานาชาติ",
      programs: [
        { name: "B.Eng. Aviation Engineering and Commercial Pilot (International)", name_th: "วศ.บ. วิศวกรรมการบินและนักบินพาณิชย์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.B.A. Logistics Management (International)", name_th: "บธ.บ. การจัดการโลจิสติกส์ (นานาชาติ)", degree_type: "bachelor", is_international: true },
        { name: "B.Eng. Aerospace Engineering (International)", name_th: "วศ.บ. วิศวกรรมการบินและอวกาศ (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "Faculty of Liberal Arts",
      name_th: "คณะศิลปศาสตร์",
      programs: [
        { name: "B.A. English Language", name_th: "ศศ.บ. ภาษาอังกฤษ", degree_type: "bachelor", is_international: false },
        { name: "B.A. Japanese Language for Business", name_th: "ศศ.บ. ภาษาญี่ปุ่นธุรกิจ", degree_type: "bachelor", is_international: false },
        { name: "B.A. Chinese Language for Industry", name_th: "ศศ.บ. ภาษาจีนเพื่ออุตสาหกรรม", degree_type: "bachelor", is_international: false },
        { name: "B.A. Tourism and Service Innovation", name_th: "ศศ.บ. นวัตกรรมการท่องเที่ยวและการบริการ", degree_type: "bachelor", is_international: false },
        { name: "B.A. Aviation Service Management", name_th: "ศศ.บ. การจัดการบริการการบิน", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "Faculty of Medicine",
      name_th: "คณะแพทยศาสตร์",
      programs: [
        { name: "M.D. Doctor of Medicine", name_th: "พ.บ. แพทยศาสตรบัณฑิต", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "Institute of Music Science and Engineering",
      name_th: "วิทยาลัยวิศวกรรมสังคีต",
      programs: [
        { name: "B.Eng. Music Engineering and Multimedia", name_th: "วศ.บ. วิศวกรรมดนตรีและสื่อประสม", degree_type: "bachelor", is_international: false },
        { name: "B.Tech. Technology and Creative Arts", name_th: "ทล.บ. เทคโนโลยีและศิลปะสร้างสรรค์", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "School of Dentistry",
      name_th: "คณะทันตแพทยศาสตร์",
      programs: [
        { name: "D.D.S. Doctor of Dental Surgery (International)", name_th: "ท.บ. ทันตแพทยศาสตรบัณฑิต (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "School of Integrated Innovative Technology",
      name_th: "คณะเทคโนโลยีนวัตกรรมบูรณาการ",
      programs: [
        { name: "B.Eng. Nanomaterial Engineering", name_th: "วศ.บ. วิศวกรรมวัสดุนาโน", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Smart Material Technology (International)", name_th: "วศ.บ. เทคโนโลยีวัสดุชาญฉลาด (นานาชาติ)", degree_type: "bachelor", is_international: true },
      ],
    },
    {
      name: "College of Advanced Manufacturing Innovation",
      name_th: "วิทยาลัยนวัตกรรมการผลิตขั้นสูง",
      programs: [
        { name: "B.Eng. Manufacturing Systems Engineering", name_th: "วศ.บ. วิศวกรรมระบบการผลิต", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "School of Nursing",
      name_th: "คณะพยาบาลศาสตร์",
      programs: [
        { name: "B.N.S. Nursing Science", name_th: "พย.บ. พยาบาลศาสตร์", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "KMITL Prince of Chumphon Campus",
      name_th: "วิทยาเขตชุมพรเขตรอุดมศักดิ์ จังหวัดชุมพร",
      programs: [
        { name: "B.Eng. Mechanical Engineering", name_th: "วศ.บ. วิศวกรรมเครื่องกล", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Electronics Engineering", name_th: "วศ.บ. วิศวกรรมอิเล็กทรอนิกส์", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Computer Engineering", name_th: "วศ.บ. วิศวกรรมคอมพิวเตอร์", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Energy Engineering", name_th: "วศ.บ. วิศวกรรมพลังงาน", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Electrical Engineering", name_th: "วศ.บ. วิศวกรรมไฟฟ้า", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Civil Engineering", name_th: "วศ.บ. วิศวกรรมโยธา", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Robotics and Smart Electronics", name_th: "วศ.บ. วิศวกรรมหุ่นยนต์และอิเล็กทรอนิกส์อัจฉริยะ", degree_type: "bachelor", is_international: false },
        { name: "B.Eng. Industrial Manufacturing Engineering", name_th: "วศ.บ. วิศวกรรมอุตสาหการและการผลิต", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Animal Science", name_th: "วท.บ. สัตวศาสตร์", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Fishery and Aquatic Resources Science", name_th: "วท.บ. วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Agricultural Biotechnology and Food", name_th: "วท.บ. เทคโนโลยีชีวภาพเกษตรและอาหาร", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Food Innovation and Management", name_th: "วท.บ. นวัตกรรมอาหารและการจัดการ", degree_type: "bachelor", is_international: false },
        { name: "B.Sc. Crop Production Technology", name_th: "วท.บ. เทคโนโลยีการจัดการผลิตพืช", degree_type: "bachelor", is_international: false },
        { name: "B.B.A. Business Administration", name_th: "บธ.บ. บริหารธุรกิจ", degree_type: "bachelor", is_international: false },
      ],
    },
    {
      name: "KMITL KOSEN Institute",
      name_th: "สถาบันโคเซ็นแห่งสถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
      programs: [
        { name: "B.Eng. Advanced Innovation Engineering (Continuing)", name_th: "วศ.บ. วิศวกรรมนวัตกรรมขั้นสูง (ต่อเนื่อง)", degree_type: "bachelor", is_international: false },
      ],
    },
  ],
};

// Merge with TCAS data for tuition info
function mergeTuition() {
  let tcasData;
  try {
    tcasData = JSON.parse(readFileSync("scripts/seed-data/kmitl.json", "utf-8"));
  } catch {
    console.log("No TCAS data found, skipping tuition merge");
    return;
  }

  // Build lookup from TCAS data: faculty_name -> program_name -> tuition
  const tuitionLookup = new Map();
  for (const fac of tcasData.faculties) {
    for (const prog of fac.programs) {
      const key = `${fac.name}::${prog.name}`.toLowerCase();
      tuitionLookup.set(key, prog.tuition_per_semester);
      // Also try matching by Thai name
      const keyTh = `${fac.name_th}::${prog.name_th}`.toLowerCase();
      tuitionLookup.set(keyTh, prog.tuition_per_semester);
    }
  }

  // Apply tuition to curriculum data
  let matched = 0;
  for (const fac of KMITL_CURRICULUM.faculties) {
    for (const prog of fac.programs) {
      const key = `${fac.name}::${prog.name}`.toLowerCase();
      const keyTh = `${fac.name_th}::${prog.name_th}`.toLowerCase();
      const tuition = tuitionLookup.get(key) || tuitionLookup.get(keyTh);
      if (tuition) {
        prog.tuition_per_semester = tuition;
        matched++;
      } else {
        prog.tuition_per_semester = null;
      }
    }
  }
  console.log(`Matched tuition for ${matched} programs from TCAS data`);
}

// Main
mergeTuition();

const totalPrograms = KMITL_CURRICULUM.faculties.reduce((s, f) => s + f.programs.length, 0);

const output = {
  _meta: {
    source: "office.kmitl.ac.th/oaq/curriculum/ + TCAS69 (tuition)",
    scraped_at: new Date().toISOString(),
    total_faculties: KMITL_CURRICULUM.faculties.length,
    total_programs: totalPrograms,
    note: "Bachelor programs only (for MVP Round 1 admissions)",
  },
  ...KMITL_CURRICULUM,
};

writeFileSync("scripts/seed-data/kmitl.json", JSON.stringify(output, null, 2));
console.log(`\nWritten ${totalPrograms} bachelor programs across ${KMITL_CURRICULUM.faculties.length} faculties`);
console.log("Output: scripts/seed-data/kmitl.json");

// Summary
for (const fac of KMITL_CURRICULUM.faculties) {
  const intl = fac.programs.filter((p) => p.is_international).length;
  console.log(`  ${fac.name_th} — ${fac.programs.length} programs (${intl} international)`);
}
