import { BuildingData, ValidationResult, ValidationIssue, BuildingNode } from '../types';

export function validateBuildingData(data: any): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{
        en: 'Invalid JSON: Root must be a valid JSON object.',
        bn: 'অবৈধ JSON: রুট অবশ্যই একটি বৈধ JSON অবজেক্ট হতে হবে।'
      }],
      warnings: []
    };
  }

  // 1. Check building property
  if (typeof data.building !== 'string' || data.building.trim().length === 0) {
    errors.push({
      field: 'building',
      en: 'The "building" property must be a non-empty string.',
      bn: '"building" প্রোপার্টি অবশ্যই একটি অ-খালি স্ট্রিং হতে হবে।'
    });
  }

  // 2. Check nodes array existence and bounds (2 to 60 elements)
  if (!Array.isArray(data.nodes)) {
    errors.push({
      field: 'nodes',
      en: 'The "nodes" property must be an array.',
      bn: '"nodes" প্রোপার্টি অবশ্যই একটি অ্যারে হতে হবে।'
    });
  } else {
    const nodeCount = data.nodes.length;
    if (nodeCount < 2 || nodeCount > 60) {
      errors.push({
        field: 'nodes',
        en: `The "nodes" array must contain between 2 and 60 elements (found ${nodeCount}).`,
        bn: `"nodes" অ্যারেতে অবশ্যই ২ থেকে ৬০টি উপাদান থাকতে হবে (বর্তমান সংখ্যা: ${nodeCount})।`
      });
    }
  }

  // 3. Check edges array existence and bounds (1 to 150 elements)
  if (!Array.isArray(data.edges)) {
    errors.push({
      field: 'edges',
      en: 'The "edges" property must be an array.',
      bn: '"edges" প্রোপার্টি অবশ্যই একটি অ্যারে হতে হবে।'
    });
  } else {
    const edgeCount = data.edges.length;
    if (edgeCount < 1 || edgeCount > 150) {
      errors.push({
        field: 'edges',
        en: `The "edges" array must contain between 1 and 150 elements (found ${edgeCount}).`,
        bn: `"edges" অ্যারেতে অবশ্যই ১ থেকে ১৫০টি উপাদান থাকতে হবে (বর্তমান সংখ্যা: ${edgeCount})।`
      });
    }
  }

  // 4. Check initial_state existence
  if (!data.initial_state || typeof data.initial_state !== 'object') {
    errors.push({
      field: 'initial_state',
      en: 'The "initial_state" must be an object with blocked_nodes, blocked_edges, and closed_exits arrays.',
      bn: '"initial_state" অবশ্যই একটি অবজেক্ট হতে হবে যাতে blocked_nodes, blocked_edges এবং closed_exits অ্যারে থাকে।'
    });
  } else {
    if (!Array.isArray(data.initial_state.blocked_nodes)) {
      errors.push({
        field: 'initial_state.blocked_nodes',
        en: '"initial_state.blocked_nodes" must be an array.',
        bn: '"initial_state.blocked_nodes" অবশ্যই একটি অ্যারে হতে হবে।'
      });
    }
    if (!Array.isArray(data.initial_state.blocked_edges)) {
      errors.push({
        field: 'initial_state.blocked_edges',
        en: '"initial_state.blocked_edges" must be an array.',
        bn: '"initial_state.blocked_edges" অবশ্যই একটি অ্যারে হতে হবে।'
      });
    }
    if (!Array.isArray(data.initial_state.closed_exits)) {
      errors.push({
        field: 'initial_state.closed_exits',
        en: '"initial_state.closed_exits" must be an array.',
        bn: '"initial_state.closed_exits" অবশ্যই একটি অ্যারে হতে হবে।'
      });
    }
  }

  // If basic structure has major errors, return early
  if (errors.length > 0 && (!Array.isArray(data.nodes) || !Array.isArray(data.edges))) {
    return { isValid: false, errors, warnings };
  }

  // 5. Deep validation of Nodes
  const nodeMap = new Map<string, BuildingNode>();
  let hasExitNode = false;

  for (let i = 0; i < data.nodes.length; i++) {
    const n = data.nodes[i];
    const prefix = `nodes[${i}]`;

    if (!n || typeof n !== 'object') {
      errors.push({
        field: prefix,
        en: `Node at index ${i} is not a valid object.`,
        bn: `ইনডেক্স ${i}-এর নোডটি একটি বৈধ অবজেক্ট নয়।`
      });
      continue;
    }

    // Check id
    if (typeof n.id !== 'string' || n.id.trim().length === 0) {
      errors.push({
        field: `${prefix}.id`,
        en: `Node at index ${i} must have a non-empty string "id".`,
        bn: `ইনডেক্স ${i}-এর নোডে অবশ্যই একটি অ-খালি স্ট্রিং "id" থাকতে হবে।`
      });
    } else {
      if (nodeMap.has(n.id)) {
        errors.push({
          field: `${prefix}.id`,
          en: `Duplicate node ID found: "${n.id}". Node IDs must be strictly unique and case-sensitive.`,
          bn: `অনুরূপ নোড আইডি পাওয়া গেছে: "${n.id}"। নোড আইডি অবশ্যই অনন্য এবং কেস-সংবেদনশীল হতে হবে।`
        });
      } else {
        nodeMap.set(n.id, n);
      }
    }

    // Check label
    if (typeof n.label !== 'string' || n.label.trim().length === 0) {
      errors.push({
        field: `${prefix}.label`,
        en: `Node "${n.id || i}" must have a non-empty string "label".`,
        bn: `নোড "${n.id || i}"-এ অবশ্যই একটি অ-খালি স্ট্রিং "label" থাকতে হবে।`
      });
    }

    // Check type ("room" | "junction" | "exit")
    if (!['room', 'junction', 'exit'].includes(n.type)) {
      errors.push({
        field: `${prefix}.type`,
        en: `Node "${n.id || i}" has invalid type "${n.type}". Type must be "room", "junction", or "exit".`,
        bn: `নোড "${n.id || i}"-এর ধরন "${n.type}" অবৈধ। ধরন অবশ্যই "room", "junction", অথবা "exit" হতে হবে।`
      });
    } else if (n.type === 'exit') {
      hasExitNode = true;
    }

    // Check coordinates x, y
    if (typeof n.x !== 'number' || !Number.isFinite(n.x)) {
      errors.push({
        field: `${prefix}.x`,
        en: `Node "${n.id || i}" must have a valid numeric "x" coordinate.`,
        bn: `নোড "${n.id || i}"-এ একটি বৈধ সংখ্যাসূচক "x" স্থানাঙ্ক থাকতে হবে।`
      });
    }
    if (typeof n.y !== 'number' || !Number.isFinite(n.y)) {
      errors.push({
        field: `${prefix}.y`,
        en: `Node "${n.id || i}" must have a valid numeric "y" coordinate.`,
        bn: `নোড "${n.id || i}"-এ একটি বৈধ সংখ্যাসূচক "y" স্থানাঙ্ক থাকতে হবে।`
      });
    }
  }

  if (!hasExitNode) {
    errors.push({
      field: 'nodes',
      en: 'The building dataset must contain at least one node of type "exit".',
      bn: 'ভবন ডেটাসেটে অবশ্যই কমপক্ষে একটি "exit" ধরনের নোড থাকতে হবে।'
    });
  }

  // 6. Deep validation of Edges
  const edgeIdSet = new Set<string>();
  const undirectedPairSet = new Set<string>();

  for (let i = 0; i < data.edges.length; i++) {
    const e = data.edges[i];
    const prefix = `edges[${i}]`;

    if (!e || typeof e !== 'object') {
      errors.push({
        field: prefix,
        en: `Edge at index ${i} is not a valid object.`,
        bn: `ইনডেক্স ${i}-এর এজ (করিডোর) একটি বৈধ অবজেক্ট নয়।`
      });
      continue;
    }

    // Check edge id
    if (typeof e.id !== 'string' || e.id.trim().length === 0) {
      errors.push({
        field: `${prefix}.id`,
        en: `Edge at index ${i} must have a unique non-empty string "id".`,
        bn: `ইনডেক্স ${i}-এর এজে অবশ্যই একটি অনন্য অ-খালি স্ট্রিং "id" থাকতে হবে।`
      });
    } else {
      if (edgeIdSet.has(e.id)) {
        errors.push({
          field: `${prefix}.id`,
          en: `Duplicate edge ID found: "${e.id}". Edge IDs must be unique.`,
          bn: `অনুরূপ এজ আইডি পাওয়া গেছে: "${e.id}"। এজ আইডি অবশ্যই অনন্য হতে হবে।`
        });
      } else {
        edgeIdSet.add(e.id);
      }
    }

    // Check from and to existence
    const fromExists = typeof e.from === 'string' && nodeMap.has(e.from);
    const toExists = typeof e.to === 'string' && nodeMap.has(e.to);

    if (!fromExists) {
      errors.push({
        field: `${prefix}.from`,
        en: `Edge "${e.id || i}" references unknown "from" node: "${e.from}".`,
        bn: `এজ "${e.id || i}"-এর "from" নোড "${e.from}" অস্তিত্বহীন।`
      });
    }
    if (!toExists) {
      errors.push({
        field: `${prefix}.to`,
        en: `Edge "${e.id || i}" references unknown "to" node: "${e.to}".`,
        bn: `এজ "${e.id || i}"-এর "to" নোড "${e.to}" অস্তিত্বহীন।`
      });
    }

    // Self-loop check
    if (e.from && e.to && e.from === e.to) {
      errors.push({
        field: prefix,
        en: `Edge "${e.id || i}" is a self-loop (from "${e.from}" to itself). Self-loops are strictly prohibited.`,
        bn: `এজ "${e.id || i}"-এ সেলফ-লুপ রয়েছে (একই নোড "${e.from}")। সেলফ-লুপ সম্পূর্ণ নিষিদ্ধ।`
      });
    }

    // Duplicate undirected edge check
    if (e.from && e.to && e.from !== e.to) {
      const pairKey = e.from < e.to ? `${e.from}---${e.to}` : `${e.to}---${e.from}`;
      if (undirectedPairSet.has(pairKey)) {
        errors.push({
          field: prefix,
          en: `Duplicate edge detected between "${e.from}" and "${e.to}". Only one undirected edge allowed per node pair.`,
          bn: `"${e.from}" এবং "${e.to}"-এর মধ্যে ডুপ্লিকেট করিডোর সনাক্ত হয়েছে। প্রতি নোড জোড়ায় একটিই এজ অনুমোদিত।`
        });
      } else {
        undirectedPairSet.add(pairKey);
      }
    }

    // Check cost: positive integer
    if (typeof e.cost !== 'number' || !Number.isInteger(e.cost) || e.cost <= 0) {
      errors.push({
        field: `${prefix}.cost`,
        en: `Edge "${e.id || i}" has invalid cost (${e.cost}). Cost must be a strictly positive integer (> 0).`,
        bn: `এজ "${e.id || i}"-এর কস্ট (${e.cost}) অবৈধ। কস্ট অবশ্যই ধনাত্মক পূর্ণসংখ্যা (> ০) হতে হবে।`
      });
    }
  }

  // 7. Check initial_state contents against validated nodes & edges
  if (data.initial_state && typeof data.initial_state === 'object') {
    // blocked_nodes validation
    if (Array.isArray(data.initial_state.blocked_nodes)) {
      for (const nid of data.initial_state.blocked_nodes) {
        if (typeof nid !== 'string') {
          errors.push({
            field: 'initial_state.blocked_nodes',
            en: `All entries in blocked_nodes must be string node IDs. Found: ${typeof nid}.`,
            bn: 'blocked_nodes-এর সকল উপাদান স্ট্রিং নোড আইডি হতে হবে।'
          });
          continue;
        }
        const node = nodeMap.get(nid);
        if (!node) {
          errors.push({
            field: 'initial_state.blocked_nodes',
            en: `blocked_nodes contains non-existent node ID: "${nid}".`,
            bn: `blocked_nodes-এ অনস্তিত্বশীল নোড আইডি রয়েছে: "${nid}"।`
          });
        } else if (node.type === 'exit') {
          errors.push({
            field: 'initial_state.blocked_nodes',
            en: `blocked_nodes cannot contain exit nodes ("${nid}"). Exits must be placed in "closed_exits".`,
            bn: `blocked_nodes-এ প্রস্থান নোড ("${nid}") থাকতে পারবে না। প্রস্থান বন্ধ করতে "closed_exits" ব্যবহার করুন।`
          });
        }
      }
    }

    // closed_exits validation
    if (Array.isArray(data.initial_state.closed_exits)) {
      for (const eid of data.initial_state.closed_exits) {
        if (typeof eid !== 'string') {
          errors.push({
            field: 'initial_state.closed_exits',
            en: `All entries in closed_exits must be string exit IDs. Found: ${typeof eid}.`,
            bn: 'closed_exits-এর সকল উপাদান স্ট্রিং প্রস্থান আইডি হতে হবে।'
          });
          continue;
        }
        const node = nodeMap.get(eid);
        if (!node) {
          errors.push({
            field: 'initial_state.closed_exits',
            en: `closed_exits contains non-existent node ID: "${eid}".`,
            bn: `closed_exits-এ অনস্তিত্বশীল নোড আইডি রয়েছে: "${eid}"।`
          });
        } else if (node.type !== 'exit') {
          errors.push({
            field: 'initial_state.closed_exits',
            en: `closed_exits can only contain nodes of type "exit". "${eid}" is a "${node.type}".`,
            bn: `closed_exits-এ শুধুমাত্র "exit" ধরনের নোড থাকতে পারে। "${eid}" হলো "${node.type}"।`
          });
        }
      }
    }

    // blocked_edges validation
    if (Array.isArray(data.initial_state.blocked_edges)) {
      for (const edgeId of data.initial_state.blocked_edges) {
        if (typeof edgeId !== 'string') {
          errors.push({
            field: 'initial_state.blocked_edges',
            en: `All entries in blocked_edges must be string edge IDs. Found: ${typeof edgeId}.`,
            bn: 'blocked_edges-এর সকল উপাদান স্ট্রিং এজ আইডি হতে হবে।'
          });
          continue;
        }
        if (!edgeIdSet.has(edgeId)) {
          errors.push({
            field: 'initial_state.blocked_edges',
            en: `blocked_edges contains non-existent edge ID: "${edgeId}".`,
            bn: `blocked_edges-এ অনস্তিত্বশীল এজ আইডি রয়েছে: "${edgeId}"।`
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
