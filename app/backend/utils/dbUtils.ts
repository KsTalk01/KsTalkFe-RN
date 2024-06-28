import {SQLiteBindParams, SQLiteDatabase} from 'expo-sqlite';
import {userInfo} from "os";

let db: SQLiteDatabase;
let currentUserId: string | null = null;

export const setDBInstance = (database: SQLiteDatabase) => {
  console.log("开始创建db实例")
  db = database;
};

export const setCurrentUserId = (userId: string) => {
  console.log("当前用户id====>"+userId)
  currentUserId = userId;
};

export const getCurrentUserId = () => {
  return currentUserId;
};

// export const runQuery = async (query: string, ...params: any[]): Promise<any> => {
//   if (!currentUserId) {
//     throw new Error('Current user ID is not set');
//   }
//
//   // 确定是否有 WHERE 子句
//   const whereIndex = query.toUpperCase().indexOf('WHERE');
//   let updatedQuery;
//
//   if (whereIndex !== -1) {
//     // 如果存在 WHERE 子句，在 WHERE 后插入 user_id 过滤条件
//     const insertionPoint = whereIndex + 5; // "WHERE" 的长度
//     updatedQuery = `${query.slice(0, insertionPoint)} user_id = ? AND ${query.slice(insertionPoint)}`;
//   } else {
//     // 如果不存在 WHERE 子句，添加 WHERE 子句和 user_id 过滤条件
//     const insertionPoint = query.toUpperCase().indexOf('ORDER BY');
//     if (insertionPoint !== -1) {
//       updatedQuery = `${query.slice(0, insertionPoint)} WHERE user_id = ? ${query.slice(insertionPoint)}`;
//     } else {
//       updatedQuery = `${query} WHERE user_id = ?`;
//     }
//   }
//
//   // 将 currentUserId 添加到参数列表中
//   params.push(currentUserId);
//
//   return await db.runAsync(updatedQuery, params);
// };
export const insertWithUserId = async (query: string, ...params: any[]): Promise<any> => {
  try {
    if (!currentUserId) {
      throw new Error('Current user ID is not set');
    }
    console.log("参数===》" + params)
    // 自动添加 user_id 字段和对应的值
    // 解析表名和字段部分
    const insertIndex = query.toUpperCase().indexOf('INTO') + 5;
    const valuesIndex = query.toUpperCase().indexOf('VALUES');

    if (insertIndex === -1 || valuesIndex === -1) {
      throw new Error('Query must be a valid INSERT statement');
    }

    const tablePart = query.slice(insertIndex, query.indexOf('(', insertIndex)).trim();
    console.log("insertIndex: ", insertIndex, " valuesIndex: ", valuesIndex);
    console.log("tablePart: ", tablePart);


    const columnsStartIndex = query.indexOf('(', insertIndex);
    const columnsEndIndex = query.indexOf(')', columnsStartIndex);
    const valuesStartIndex = query.indexOf('(', valuesIndex);
    const valuesEndIndex = query.indexOf(')', valuesStartIndex);

    if (columnsStartIndex === -1 || columnsEndIndex === -1 || valuesStartIndex === -1 || valuesEndIndex === -1) {
      throw new Error('Query must be a valid INSERT statement with columns and values');
    }

    const columnsPart = query.slice(columnsStartIndex + 1, columnsEndIndex).trim();
    const valuesPart = query.slice(valuesStartIndex + 1, valuesEndIndex).trim();

    console.log("columnsPart: ", columnsPart);
    console.log("valuesPart: ", valuesPart);

    // 插入 user_id 字段和占位符
    const updatedColumnsPart = `user_id, ${columnsPart}`;
    const updatedValuesPart = `?, ${valuesPart}`;

    const updatedQuery = `INSERT INTO ${tablePart} (${updatedColumnsPart}) VALUES (${updatedValuesPart});`;

    // 将 currentUserId 添加到参数列表的开头
    const updatedParams = [currentUserId, ...params];
    console.log("拼接后的insert语句====>", updatedQuery);
    console.log("拼接后的参数====>", updatedParams);
    // 执行插入查询
    return await db.runAsync(updatedQuery, updatedParams as unknown as SQLiteBindParams);
  } catch (e) {
    console.error("insert出错",e.message);
  }
};

export const getQuery = async (query: string, ...params: any[]): Promise<any> => {
  try {
    console.log(currentUserId)

    if (!currentUserId) {
      throw new Error('Current user ID is not set');
    }

    // 确定是否有 WHERE 子句
    const whereIndex = query.toUpperCase().indexOf('WHERE');
    let updatedQuery;

    if (whereIndex !== -1) {
      // 如果存在 WHERE 子句，在 WHERE 后插入 user_id 过滤条件
      const wherePoint = whereIndex + 5; // "WHERE" 的长度
      let limitPoint = query.toUpperCase().indexOf('LIMIT');
      let orderPoint = query.toUpperCase().indexOf('ORDER BY');
      let groupPoint = query.toUpperCase().indexOf('GROUP BY');
      // 过滤掉值为 -1 的索引
      let validPoints = [limitPoint, orderPoint, groupPoint].filter(point => point !== -1);
      let whereLastPoint = 0;
      // 获取最小值
      // console.log(validPoints.length !==0)
      if (validPoints.length !== 0){
        whereLastPoint = Math.min(...validPoints);
      }

      console.log("==================================",whereLastPoint)
      if (whereLastPoint!==0){
        updatedQuery = `${query.slice(0, whereLastPoint)} AND user_id = ? ${query.slice(whereLastPoint)}`;
      }else{
        // console.log("jinjinijinijni");
        // console.log(`${query.slice(wherePoint,-1)}`)
        updatedQuery = `${query.slice(0, wherePoint)}  ${query.slice(wherePoint)} AND user_id = ?; `;
      }

    } else {
      // 如果不存在 WHERE 子句，添加 WHERE 子句和 user_id 过滤条件
      const insertionPoint = query.toUpperCase().indexOf('ORDER BY');
      // console.log("asdasdasfas",`${query.slice(0, insertionPoint)}`)
      if (insertionPoint !== -1) {
        updatedQuery = `${query.slice(0, insertionPoint)} WHERE user_id = ? ${query.slice(insertionPoint)}`;
      } else {
        updatedQuery = `${query} WHERE user_id = ?`;
      }
    }

    // 将 currentUserId 添加到参数列表中
    if (query.toUpperCase().indexOf('LIMIT')!==-1){
      params.splice(-2, 0, currentUserId);
    }else {
      params.push(currentUserId);
    }

    // console.log("执行的查询语句为===>" + updatedQuery);
    console.log("参数为===》" + params);
    // // 打印每个参数的类型
    // params.forEach((param, index) => {
    //   console.log(`Param ${index + 1} (${typeof param}):`, param);
    // });
    if (query.toUpperCase().indexOf('SELECT')!==-1){
      console.log("查询");
      console.log("查询语句为=====>",updatedQuery);
      return await db.getAllAsync(updatedQuery, params);
    }else {
      console.log("非查询");
      console.log("非查询语句为=====>",updatedQuery);
      return await db.runAsync(updatedQuery,params)
    }
  } catch (e) {
    console.error("查询错误=====>",e.message)
  }
};

export { db };
